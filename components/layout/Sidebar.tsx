'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  Home, Compass, Music2, Sliders, Library,
  Search, Anchor, Bell, ChevronLeft, ChevronRight, Zap
} from 'lucide-react'

const NAV_ITEMS = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Compass, label: 'Explore', href: '/explore' },
  { icon: Music2, label: 'Create', href: '/create' },
  { icon: Sliders, label: 'Studio', href: '/studio' },
  { icon: Library, label: 'Library', href: '/profile' },
  { icon: Search, label: 'Search', href: '/explore?search=1' },
  { icon: Anchor, label: 'Hooks', href: '/hooks' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen, profile } = useAppStore()

  return (
    <aside className={cn(
      'flex flex-col bg-surface-1 border-r border-surface-border transition-all duration-300 flex-shrink-0 relative',
      sidebarOpen ? 'w-56' : 'w-16'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-surface-border">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center flex-shrink-0">
            <Music2 size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-display font-800 text-lg tracking-wider text-white">MELODAI</span>
          )}
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-zinc-600 hover:text-zinc-400 transition-colors ml-1"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* User info */}
      {profile && (
        <div className={cn(
          'flex items-center gap-3 px-3 py-3 border-b border-surface-border',
        )}>
          <div className="w-9 h-9 rounded-full bg-brand-gradient-h flex items-center justify-center flex-shrink-0 text-sm font-bold">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              (profile.full_name || profile.username || 'U')[0].toUpperCase()
            )}
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-white">
                {profile.username || profile.full_name || 'User'}
              </p>
              <p className="text-xs text-brand-orange font-medium">
                ⚡ {profile.credits} credits
              </p>
            </div>
          )}
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href.split('?')[0]))
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group',
                active
                  ? 'bg-surface-3 text-white border-l-2 border-brand-orange'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-surface-2 border-l-2 border-transparent'
              )}
            >
              <Icon size={17} className="flex-shrink-0" />
              {sidebarOpen && (
                <span className={cn('text-sm whitespace-nowrap', active ? 'font-600' : 'font-400')}>
                  {label}
                </span>
              )}
              {sidebarOpen && label === 'Hooks' && (
                <span className="ml-auto text-xs bg-brand-gradient text-white px-2 py-0.5 rounded-full font-bold">
                  + New
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Go Pro */}
      {sidebarOpen && (
        <div className="m-3 p-4 rounded-xl noise relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #1a0800, #200d00)',
          border: '1px solid rgba(249,115,22,0.3)'
        }}>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-brand-orange" />
            <span className="text-sm font-700 text-brand-orange font-display">Go Pro</span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed mb-3">
            Unlimited songs, priority generation & more credits
          </p>
          <button className="w-full py-2 text-xs font-700 text-white rounded-lg bg-brand-gradient hover:opacity-90 transition-opacity">
            Upgrade Now
          </button>
        </div>
      )}
    </aside>
  )
}
