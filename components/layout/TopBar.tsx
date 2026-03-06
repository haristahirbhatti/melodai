'use client'
import { Menu } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import Link from 'next/link'

export function TopBar() {
  const { setSidebarOpen, profile } = useAppStore()
  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-surface-border bg-surface-1 flex-shrink-0">
      <button onClick={() => setSidebarOpen(true)} className="text-zinc-400 hover:text-white transition-colors">
        <Menu size={22} />
      </button>
      <Link href="/" className="flex items-center gap-2">
        <img src="/logo.jpeg" alt="HmongSuav" className="w-8 h-8 rounded-lg object-cover" />
        <span className="font-display font-800 text-base tracking-wider">HMONGSUAV</span>
      </Link>
      <div className="w-8 h-8 rounded-full bg-brand-gradient-h flex items-center justify-center text-xs font-bold overflow-hidden">
        {profile?.avatar_url
          ? <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
          : (profile?.full_name || profile?.username || 'U')[0]?.toUpperCase() || 'U'
        }
      </div>
    </div>
  )
}