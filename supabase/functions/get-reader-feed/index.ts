import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FeedRequest {
  readerId?: string
  genre?: string
  limit?: number
  offset?: number
  sortBy?: 'popular' | 'newest' | 'trending'
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
    const readerId = url.searchParams.get('readerId')
    const genre = url.searchParams.get('genre')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const sortBy = url.searchParams.get('sortBy') || 'popular'

    console.log(`Getting reader feed - genre: ${genre}, limit: ${limit}, sortBy: ${sortBy}`)

    let query = supabase
      .from('stories')
      .select(`
        *,
        profiles!stories_author_id_fkey (
          display_name,
          username
        ),
        story_tags (
          tag
        ),
        chapters (
          id
        )
      `)
      .eq('status', 'published')

    // Apply genre filter
    if (genre && genre !== 'all') {
      query = query.eq('genre', genre)
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        query = query.order('like_count', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'trending':
        query = query.order('view_count', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: stories, error } = await query

    if (error) {
      console.error('Error fetching reader feed:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch stories' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get reader's reading progress if readerId provided
    let readingProgress = {}
    if (readerId) {
      const { data: progressData } = await supabase
        .from('reads')
        .select('novel_id, chapter_id, slide_number, completed')
        .eq('reader_id', readerId)

      if (progressData) {
        readingProgress = progressData.reduce((acc: any, read: any) => {
          acc[read.novel_id] = {
            chapterId: read.chapter_id,
            slideNumber: read.slide_number,
            completed: read.completed
          }
          return acc
        }, {} as Record<string, any>)
      }

      // Get reader's likes
      const { data: likesData } = await supabase
        .from('likes')
        .select('story_id')
        .eq('user_id', readerId)

      if (likesData) {
        const likedStoryIds = new Set(likesData.map(like => like.story_id))
        stories?.forEach(story => {
          story.isLiked = likedStoryIds.has(story.id)
        })
      }
    }

    // Enhance stories with additional metadata
    const enhancedStories = stories?.map((story: any) => ({
      ...story,
      chapterCount: story.chapters?.length || 0,
      tags: story.story_tags?.map((tag: any) => tag.tag) || [],
      author: story.profiles?.display_name || story.profiles?.username || 'Unknown Author',
      readingProgress: (readingProgress as Record<string, any>)[story.id] || null
    }))

    console.log(`Successfully fetched ${enhancedStories?.length || 0} stories for reader feed`)

    return new Response(
      JSON.stringify({ 
        stories: enhancedStories,
        hasMore: (enhancedStories?.length || 0) === limit
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-reader-feed function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})