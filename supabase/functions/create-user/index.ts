import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify admin authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    if (rolesError || !roles.some(r => r.role === 'admin')) {
      throw new Error('Unauthorized: Admin access required')
    }

    const { email, password, roles: newUserRoles, username, display_name } = await req.json()

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!Array.isArray(newUserRoles) || newUserRoles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one role is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user with admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        username: username || null,
        display_name: display_name || null,
      }
    })

    if (createError) {
      console.error('User creation error:', createError)
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!newUser.user) {
      throw new Error('User creation failed')
    }

    console.log('User created:', newUser.user.id)

    // Wait a bit for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Assign roles
    const roleInserts = newUserRoles.map(role => ({
      user_id: newUser.user.id,
      role: role
    }))

    const { error: rolesInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert(roleInserts)

    if (rolesInsertError) {
      console.error('Roles assignment error:', rolesInsertError)
      // User was created but roles failed - still return success but with warning
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: newUser.user,
          warning: 'User created but role assignment failed: ' + rolesInsertError.message 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Roles assigned:', newUserRoles)

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: newUser.user,
        message: 'User created successfully with roles: ' + newUserRoles.join(', ')
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})