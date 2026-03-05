'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Home, Compass, Music2, Library, Search, Bell, ChevronLeft, ChevronRight, Zap, X, Settings, Sparkles } from 'lucide-react'

// Notifications Panel
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'activity'>('notifications')

  const notifications = [
    { id: 1, tag: 'New Feature!', tagColor: 'bg-pink-500', title: 'Lyrics Mode 🎵', desc: 'You can now paste your own lyrics and generate a song with your exact words!', time: 'Just now' },
    { id: 2, tag: 'Tip', tagColor: 'bg-brand-orange', title: 'Use Inspiration Tags', desc: 'Select style tags like "Hmong folk" or "sad ballad" to guide the AI generation.', time: '2h ago' },
    { id: 3, tag: 'Welcome', tagColor: 'bg-emerald-500', title: 'Welcome to HmongSuav! 🎉', desc: 'Start creating your first AI-powered song. You have 30 free credits to get started.', time: '1d ago' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed left-16 lg:left-56 top-0 h-full w-80 bg-surface-1 border-r border-surface-border z-50 flex flex-col shadow-2xl animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div className="flex gap-1">
            {(['notifications', 'activity'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn('px-4 py-2 rounded-lg text-sm font-600 capitalize transition-all',
                  activeTab === tab ? 'text-white bg-surface-3' : 'text-zinc-500 hover:text-zinc-300'
                )}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="text-zinc-600 hover:text-zinc-400 transition-colors">
              <Settings size={16} />
            </button>
            <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'notifications' ? (
            notifications.map(n => (
              <div key={n.id} className="bg-surface-2 rounded-xl p-4 border border-surface-border2 relative group">
                <button className="absolute top-3 right-3 text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all">
                  <X size={14} />
                </button>
                <span className={`text-xs font-700 text-white px-2.5 py-1 rounded-full ${n.tagColor} inline-block mb-2`}>
                  {n.tag}
                </span>
                <p className="text-sm font-600 text-white mb-1">{n.title}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{n.desc}</p>
                <p className="text-[10px] text-zinc-600 mt-2">{n.time}</p>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Sparkles size={32} className="text-zinc-700 mb-3" />
              <p className="text-zinc-500 text-sm font-500">No recent activity</p>
              <p className="text-zinc-700 text-xs mt-1">Your song activity will appear here</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Search Panel
function SearchPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed left-16 lg:left-56 top-0 h-full w-80 bg-surface-1 border-r border-surface-border z-50 flex flex-col shadow-2xl animate-in">
        <div className="px-4 py-4 border-b border-surface-border flex items-center gap-3">
          <Search size={16} className="text-zinc-500 flex-shrink-0" />
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search songs, artists..."
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none" />
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-center p-8">
          {query ? (
            <div>
              <p className="text-zinc-400 text-sm">Searching for</p>
              <p className="text-white font-600 mt-1">"{query}"</p>
              <Link href={`/explore?q=${query}`} onClick={onClose}
                className="mt-4 inline-block px-5 py-2.5 bg-brand-gradient text-white text-sm font-600 rounded-full">
                View Results
              </Link>
            </div>
          ) : (
            <div>
              <Search size={32} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">Type to search songs</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const NAV_ITEMS = [
  { icon: Home, label: 'Home', href: '/', panel: null },
  { icon: Compass, label: 'Explore', href: '/explore', panel: null },
  { icon: Music2, label: 'Create', href: '/create', panel: null },
  { icon: Library, label: 'Library', href: '/profile', panel: null },
  { icon: Search, label: 'Search', href: null, panel: 'search' },
  { icon: Bell, label: 'Notifications', href: null, panel: 'notifications' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen, profile } = useAppStore()
  const [openPanel, setOpenPanel] = useState<string | null>(null)

  const togglePanel = (panel: string) => {
    setOpenPanel(prev => prev === panel ? null : panel)
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        'flex flex-col bg-surface-1 border-r border-surface-border transition-all duration-300 flex-shrink-0 z-40',
        'fixed lg:relative inset-y-0 left-0',
        sidebarOpen ? 'w-56 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-surface-border">
          <Link href="/" className="flex items-center gap-2.5 min-w-0" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center flex-shrink-0">
              <Music2 size={16} className="text-white" />
            </div>
            {sidebarOpen && <span className="font-display font-800 text-lg tracking-wider text-white">HMONGSUAV</span>}
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-zinc-600 hover:text-zinc-400 lg:hidden">
            <X size={18} />
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-zinc-600 hover:text-zinc-400 hidden lg:block">
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* User */}
        {profile && (
          <div className="flex items-center gap-3 px-3 py-3 border-b border-surface-border">
            <div className="w-9 h-9 rounded-full bg-brand-gradient-h flex items-center justify-center flex-shrink-0 text-sm font-bold overflow-hidden">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : (profile.full_name || profile.username || 'U')[0].toUpperCase()
              }
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-white">{profile.username || profile.full_name || 'User'}</p>
                <p className="text-xs text-brand-orange font-medium">⚡ {profile.credits} credits</p>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label, href, panel }) => {
            const isActive = href
              ? (pathname === href || (href !== '/' && pathname.startsWith(href)))
              : openPanel === panel

            if (href) {
              return (
                <Link key={label} href={href} onClick={() => { setSidebarOpen(false); setOpenPanel(null) }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 w-full',
                    isActive ? 'bg-surface-3 text-white border-l-2 border-brand-orange' : 'text-zinc-500 hover:text-zinc-300 hover:bg-surface-2 border-l-2 border-transparent'
                  )}>
                  <Icon size={17} className="flex-shrink-0" />
                  {sidebarOpen && <span className={cn('text-sm whitespace-nowrap', isActive ? 'font-600' : 'font-400')}>{label}</span>}
                </Link>
              )
            }

            return (
              <button key={label} onClick={() => togglePanel(panel!)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 w-full text-left',
                  isActive ? 'bg-surface-3 text-white border-l-2 border-brand-orange' : 'text-zinc-500 hover:text-zinc-300 hover:bg-surface-2 border-l-2 border-transparent'
                )}>
                <Icon size={17} className="flex-shrink-0" />
                {sidebarOpen && <span className={cn('text-sm whitespace-nowrap', isActive ? 'font-600' : 'font-400')}>{label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Go Pro */}
        {sidebarOpen && (
          <Link href="/pro" onClick={() => setSidebarOpen(false)}
            className="m-3 p-4 rounded-xl block hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #1a0800, #200d00)', border: '1px solid rgba(249,115,22,0.3)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-brand-orange" />
              <span className="text-sm font-700 text-brand-orange font-display">Go Pro</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">Unlimited songs & more credits</p>
          </Link>
        )}
      </aside>

      {/* Panels */}
      {openPanel === 'notifications' && <NotificationsPanel onClose={() => setOpenPanel(null)} />}
      {openPanel === 'search' && <SearchPanel onClose={() => setOpenPanel(null)} />}
    </>
  )
}