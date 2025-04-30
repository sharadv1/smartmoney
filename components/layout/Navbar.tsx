'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Journal', href: '/journal' },
  { name: 'Trade Logs', href: '/trades' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Settings', href: '/settings' },
]

export function Navbar() {
  const pathname = usePathname()

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
          <Link
            href="/auth/profile"
            className="text-sm font-medium transition-colors hover:text-primary-foreground/80"
          >
            Profile
          </Link>
        </div>
      </div>
    </header>
  )
}
