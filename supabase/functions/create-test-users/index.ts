import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create admin client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const testUsers = [
      {
        email: 'testwriter@example.com',
        password: 'password123',
        user_metadata: {
          username: 'testwriter',
          display_name: 'Test Writer',
          role: 'writer'
        },
        user_id: '11111111-1111-1111-1111-111111111111'
      },
      {
        email: 'testreader@example.com',
        password: 'password123',
        user_metadata: {
          username: 'testreader',
          display_name: 'Test Reader',
          role: 'reader'
        },
        user_id: '22222222-2222-2222-2222-222222222222'
      },
      {
        email: 'testadmin@example.com',
        password: 'password123',
        user_metadata: {
          username: 'testadmin',
          display_name: 'Test Admin',
          role: 'admin'
        },
        user_id: '33333333-3333-3333-3333-333333333333'
      }
    ]

    const results = []

    for (const userData of testUsers) {
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(userData.user_id)
      
      if (existingUser.user) {
        results.push({ 
          email: userData.email, 
          status: 'already_exists',
          user_id: userData.user_id 
        })
        continue
      }

      // Create the user with admin API
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Skip email confirmation for test users
        user_metadata: userData.user_metadata
      })

      if (createError) {
        console.error(`Failed to create user ${userData.email}:`, createError)
        results.push({ 
          email: userData.email, 
          status: 'error', 
          error: createError.message 
        })
        continue
      }

      // Update the user ID to match our test data
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        newUser.user.id,
        { 
          id: userData.user_id,
          user_metadata: userData.user_metadata 
        }
      )

      if (updateError) {
        console.error(`Failed to update user ID for ${userData.email}:`, updateError)
      }

      results.push({ 
        email: userData.email, 
        status: 'created',
        user_id: newUser.user.id 
      })
    }

    // Now insert the test data
    await insertTestData(supabaseAdmin)

    return new Response(JSON.stringify({ 
      success: true, 
      users: results,
      message: 'Test users created successfully!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error creating test users:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

async function insertTestData(supabaseAdmin: any) {
  // Insert test stories for the writer
  const { error: storiesError } = await supabaseAdmin
    .from('stories')
    .upsert([
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        author_id: '11111111-1111-1111-1111-111111111111',
        title: 'The Digital Nomad Chronicles',
        description: 'A thrilling adventure of a programmer who discovers hidden secrets in code.',
        genre: 'Sci-Fi',
        status: 'published',
        view_count: 150,
        like_count: 25,
        comment_count: 8
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        author_id: '11111111-1111-1111-1111-111111111111',
        title: 'Coffee Shop Mysteries',
        description: 'Strange things happen at the corner coffee shop every Tuesday.',
        genre: 'Mystery',
        status: 'published',
        view_count: 89,
        like_count: 12,
        comment_count: 3
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        author_id: '11111111-1111-1111-1111-111111111111',
        title: 'Work in Progress',
        description: 'This story is still being written.',
        genre: 'Drama',
        status: 'draft',
        view_count: 0,
        like_count: 0,
        comment_count: 0
      }
    ])

  if (storiesError) {
    console.error('Error inserting stories:', storiesError)
  }

  // Insert test chapters
  const { error: chaptersError } = await supabaseAdmin
    .from('chapters')
    .upsert([
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        story_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        chapter_number: 1,
        title: 'The Discovery',
        content: 'Chapter 1 content: It was a dark and stormy night when Sarah first noticed the strange patterns in her code...',
        status: 'published',
        view_count: 50,
        word_count: 850,
        slide_count: 10
      },
      {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        story_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        chapter_number: 2,
        title: 'The Investigation',
        content: 'Chapter 2 content: The next morning, Sarah decided to investigate further...',
        status: 'published',
        view_count: 35,
        word_count: 920,
        slide_count: 12
      },
      {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        story_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        chapter_number: 1,
        title: 'Tuesday Morning',
        content: 'Chapter 1 content: Every Tuesday at exactly 9:15 AM, the coffee machine would make a sound...',
        status: 'published',
        view_count: 25,
        word_count: 650,
        slide_count: 8
      }
    ])

  if (chaptersError) {
    console.error('Error inserting chapters:', chaptersError)
  }

  // Insert test slides
  const { error: slidesError } = await supabaseAdmin
    .from('slides')
    .upsert([
      {
        id: 'slide001-1111-1111-1111-111111111111',
        chapter_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        slide_number: 1,
        content: 'It was a dark and stormy night...'
      },
      {
        id: 'slide002-1111-1111-1111-111111111111',
        chapter_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        slide_number: 2,
        content: 'Sarah sat at her computer, lines of code flowing across her screen.'
      },
      {
        id: 'slide003-1111-1111-1111-111111111111',
        chapter_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        slide_number: 3,
        content: 'Something was different about tonight. The patterns seemed... alive.'
      },
      {
        id: 'slide004-1111-1111-1111-111111111111',
        chapter_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        slide_number: 1,
        content: 'Every Tuesday at exactly 9:15 AM...'
      },
      {
        id: 'slide005-1111-1111-1111-111111111111',
        chapter_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        slide_number: 2,
        content: 'The coffee machine would make a sound that defied explanation.'
      }
    ])

  if (slidesError) {
    console.error('Error inserting slides:', slidesError)
  }

  // Insert test library entries
  const { error: libraryError } = await supabaseAdmin
    .from('library')
    .upsert([
      {
        id: 'lib11111-1111-1111-1111-111111111111',
        user_id: '22222222-2222-2222-2222-222222222222',
        story_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
      },
      {
        id: 'lib22222-2222-2222-2222-222222222222',
        user_id: '22222222-2222-2222-2222-222222222222',
        story_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
      }
    ])

  if (libraryError) {
    console.error('Error inserting library entries:', libraryError)
  }

  // Insert test reading progress
  const { error: readsError } = await supabaseAdmin
    .from('reads')
    .upsert([
      {
        id: 'read1111-1111-1111-1111-111111111111',
        user_id: '22222222-2222-2222-2222-222222222222',
        story_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        chapter_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        slide_id: 'slide002-1111-1111-1111-111111111111',
        progress: 65.5
      },
      {
        id: 'read2222-2222-2222-2222-222222222222',
        user_id: '22222222-2222-2222-2222-222222222222',
        story_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        chapter_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        slide_id: 'slide005-1111-1111-1111-111111111111',
        progress: 100.0
      }
    ])

  if (readsError) {
    console.error('Error inserting reads:', readsError)
  }

  // Insert test comments
  const { error: commentsError } = await supabaseAdmin
    .from('comments')
    .upsert([
      {
        id: 'comm1111-1111-1111-1111-111111111111',
        user_id: '22222222-2222-2222-2222-222222222222',
        story_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        chapter_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        content: 'This is a fascinating start! Can\'t wait to see where this goes.'
      },
      {
        id: 'comm2222-2222-2222-2222-222222222222',
        user_id: '22222222-2222-2222-2222-222222222222',
        story_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        chapter_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        content: 'The coffee shop mystery is so intriguing!'
      }
    ])

  if (commentsError) {
    console.error('Error inserting comments:', commentsError)
  }

  // Insert test likes
  const { error: likesError } = await supabaseAdmin
    .from('likes')
    .upsert([
      {
        id: 'like1111-1111-1111-1111-111111111111',
        user_id: '22222222-2222-2222-2222-222222222222',
        story_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
      },
      {
        id: 'like2222-2222-2222-2222-222222222222',
        user_id: '22222222-2222-2222-2222-222222222222',
        story_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
      }
    ])

  if (likesError) {
    console.error('Error inserting likes:', likesError)
  }
}