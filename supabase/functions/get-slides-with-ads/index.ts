import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SlidesRequest {
  chapterId: string
  readerId?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const chapterId = url.searchParams.get('chapterId')
    const readerId = url.searchParams.get('readerId')

    if (!chapterId) {
      return new Response(
        JSON.stringify({ error: 'chapterId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Getting slides with ads for chapter ${chapterId}`)

    // Get chapter slides
    const { data: slides, error: slidesError } = await supabase
      .from('slides')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('order_number', { ascending: true })

    if (slidesError) {
      console.error('Error fetching slides:', slidesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch slides' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get system setting for ad frequency
    const { data: adFrequencySetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('setting_key', 'ads_frequency')
      .single()

    const adFrequency = parseInt(adFrequencySetting?.value || '6')

    // Get active ads
    const today = new Date().toISOString().split('T')[0]
    const { data: ads, error: adsError } = await supabase
      .from('ads')
      .select('*')
      .lte('start_date', today)
      .gte('end_date', today)

    if (adsError) {
      console.error('Error fetching ads:', adsError)
    }

    // Create slides with ads inserted
    const slidesWithAds: any[] = []
    const activeAds = ads || []
    let adIndex = 0

    slides?.forEach((slide, index) => {
      slidesWithAds.push({
        type: 'slide',
        ...slide
      })

      // Insert ad every N slides (where N is adFrequency)
      if ((index + 1) % adFrequency === 0 && activeAds.length > 0) {
        const ad = activeAds[adIndex % activeAds.length]
        slidesWithAds.push({
          type: 'ad',
          id: ad.id,
          video_url: ad.video_url,
          position: index + 1
        })

        // Log ad impression if readerId provided
        if (readerId) {
          // Fire and forget - don't block on ad logging
          (async () => {
            try {
              await supabase
                .from('ad_logs')
                .insert({
                  reader_id: readerId,
                  ad_id: ad.id,
                  slide_position: index + 1,
                  watched: false
                })
              
              // Update ad impression count
              await supabase.rpc('increment_ad_impressions', { ad_id: ad.id })
            } catch (error) {
              console.error('Error logging ad impression:', error)
            }
          })()
        }

        adIndex++
      }
    })

    console.log(`Successfully fetched ${slides?.length || 0} slides with ${adIndex} ads inserted`)

    return new Response(
      JSON.stringify({ 
        slides: slidesWithAds,
        totalSlides: slides?.length || 0,
        adsInserted: adIndex
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-slides-with-ads function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})