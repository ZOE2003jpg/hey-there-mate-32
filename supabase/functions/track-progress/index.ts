import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProgressRequest {
  readerId: string
  storyId: string
  chapterId: string
  slideId: string
  progress: number
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

    const { readerId, storyId, chapterId, slideId, progress }: ProgressRequest = await req.json()

    if (!readerId || !storyId || !chapterId || slideId === undefined || progress === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Tracking progress for reader ${readerId}, story ${storyId}, chapter ${chapterId}, slide ${slideId}`)

    // Upsert reading progress
    const { data, error } = await supabase
      .from('reads')
      .upsert({
        user_id: readerId,
        story_id: storyId,
        chapter_id: chapterId,
        slide_id: slideId,
        progress: progress,
        last_read_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,story_id,chapter_id'
      })
      .select()

    if (error) {
      console.error('Error tracking progress:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to track progress' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update analytics if progress is 100%
    if (progress >= 100) {
      // Increment chapter view count
      await supabase.rpc('increment_chapter_views', { chapter_id: chapterId })
      
      // Increment story view count
      await supabase.rpc('increment_story_views', { story_id: storyId })
    }

    console.log(`Successfully tracked progress for reader ${readerId}`)

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in track-progress function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})