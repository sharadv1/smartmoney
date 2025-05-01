/* app/(auth)/login/page.tsx */
'use client'

import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  async function signIn() {
    // Opens the GitHub OAuth flow
    await supabase.auth.signInWithOAuth({ provider: 'github' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Button onClick={signIn}>Sign in with GitHub</Button>
    </div>
  )
}