import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "@/integrations/supabase/client"
import { User as SupabaseUser, Session } from '@supabase/supabase-js'

export type UserRole = "reader" | "writer" | "admin"

export interface Profile {
  id: string
  user_id: string
  username: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  status: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  profile: Profile | null
  roles: UserRole[]
}

interface UserContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, role?: UserRole) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  createProfile: (role: UserRole) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return
        
        console.log('Auth state changed:', event, session?.user?.id)
        setSession(session)
        
        if (session?.user) {
          // Fetch user profile and roles asynchronously without blocking
          setTimeout(async () => {
            if (!mounted) return
            
            try {
              // Fetch profile and roles in parallel
              const [profileResult, rolesResult] = await Promise.all([
                supabase
                  .from('profiles')
                  .select('*')
                  .eq('user_id', session.user.id)
                  .single(),
                supabase
                  .from('user_roles')
                  .select('role')
                  .eq('user_id', session.user.id)
              ])

              if (!mounted) return

              const profile = profileResult.error ? null : profileResult.data
              const roles = rolesResult.error ? [] : rolesResult.data.map(r => r.role as UserRole)

              setUser({
                id: session.user.id,
                email: session.user.email || '',
                profile,
                roles
              })
            } catch (error) {
              console.error('Profile/roles fetch failed:', error)
              if (mounted) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  profile: null,
                  roles: []
                })
              }
            }
          }, 0)
        } else {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    // Check for existing session on mount
    const initializeAuth = async () => {
      if (!mounted) return
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) {
          console.error('Session error:', error)
          setLoading(false)
          return
        }
        
        // Don't set user state here, let onAuthStateChange handle it
        if (!session) {
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, role: UserRole = 'reader') => {
    const redirectUrl = `${window.location.origin}/`
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          role
        }
      }
    })
    
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    return { error }
  }

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    })
    
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const createProfile = async (role: UserRole) => {
    if (!session?.user) return

    // Create profile without role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: session.user.id,
        status: 'active'
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return
    }

    // Assign role in user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: session.user.id,
        role
      })

    if (roleError) {
      console.error('Error assigning role:', roleError)
    }
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signUp, 
      signIn, 
      signInWithGoogle,
      signOut, 
      createProfile 
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}