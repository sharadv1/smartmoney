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

/**
 * Get the current authenticated user from cookies (for server components/actions)
 */
export async function getUser() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value
  if (!accessToken) return null

  const { data, error } = await supabaseServer.auth.getUser(accessToken)
  if (error || !data?.user) return null
  return data.user
}
