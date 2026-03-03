'use client'
import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { PlayerBar } from '@/components/player/PlayerBar'
import { useAppStore } from '@/lib/store'
import type { Profile } from '@/types'

interface AppShellProps {
  children: React.ReactNode
  profile: Profile | null
}

export function AppShell({ children, profile }: AppShellProps) {
  const { setProfile } = useAppStore()

  useEffect(() => {
    setProfile(profile)
  }, [profile])

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
        <PlayerBar />
      </div>
    </div>
  )
}
