'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Music2, Library, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Compass, label: 'Explore', href: '/explore' },
  { icon: Music2, label: 'Create', href: '/create' },
  { icon: Library, label: 'Library', href: '/profile' },
  { icon: User, label: 'Profile', href: '/profile' },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="lg:hidden flex items-center justify-around border-t border-surface-border bg-surface-1 px-2 py-2 flex-shrink-0">
      {ITEMS.map(({ icon: Icon, label, href }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link key={label} href={href} className={cn(
            'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all',
            active ? 'text-brand-orange' : 'text-zinc-600 hover:text-zinc-400'
          )}>
            <Icon size={20} />
            <span className="text-[10px] font-500">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}