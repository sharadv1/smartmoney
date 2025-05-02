'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import type { Session } from '@supabase/auth-helpers-nextjs'

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Journal', href: '/journal' },
  { name: 'Trade Logs', href: '/trades' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Settings', href: '/settings' },
]

export function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname()
  const { supabase } = useSupabase()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold">
            Trading Journal
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary-foreground/80",
                  pathname === item.href
                    ? "text-primary-foreground"
                    : "text-primary-foreground/60"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <span className="text-sm">{session.user.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
