import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for the entire server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
import { cookies } from 'next/headers'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

/**
 * Get the current authenticated user from cookies (for server components/actions)
 */
export async function getUser() {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}
