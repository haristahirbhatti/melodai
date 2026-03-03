'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SongCard } from '@/components/songs/SongCard'
import type { Song, Profile } from '@/types'
import { cn } from '@/lib/utils'
import { Music2, Heart, Settings, LogOut, Crown, Zap, Copy, Check } from 'lucide-react'

interface Props {
  profile: Profile
  songs: Song[]
  likedSongs: Song[]
}

export function ProfileClient({ profile, songs, likedSongs }: Props) {
  const [activeTab, setActiveTab] = useState<'songs' | 'liked'>('songs')
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const copyUsername = () => {
    navigator.clipboard.writeText(profile.username || profile.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const completedSongs = songs.filter(s => s.status === 'completed')
  const totalPlays = songs.reduce((acc, s) => acc + s.play_count, 0)

  return (
    <div className="h-full overflow-y-auto">
      {/* Profile header */}
      <div className="relative px-8 pt-10 pb-8 border-b border-surface-border">
        {/* Background gradient */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top left, #f97316 0%, transparent 60%)' }} />

        <div className="relative flex items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-brand-gradient-h flex items-center justify-center text-2xl font-800 flex-shrink-0 relative">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              (profile.full_name || profile.username || 'U')[0].toUpperCase()
            )}
            {profile.plan === 'pro' && (
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center">
                <Crown size={12} className="text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display font-800 text-2xl">
                {profile.full_name || profile.username || 'Music Creator'}
              </h1>
              {profile.plan === 'pro' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-orange/10 border border-brand-orange/30 text-brand-orange font-600">
                  PRO
                </span>
              )}
            </div>

            <button onClick={copyUsername} className="flex items-center gap-1.5 text-zinc-500 text-sm hover:text-zinc-300 transition-colors mb-4">
              @{profile.username || profile.id.slice(0, 8)}
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>

            {/* Stats */}
            <div className="flex items-center gap-6">
              {[
                { label: 'Songs', value: completedSongs.length },
                { label: 'Total Plays', value: totalPlays },
                { label: 'Liked', value: likedSongs.length },
                { label: 'Credits', value: profile.credits },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-lg font-700 text-white">{value}</p>
                  <p className="text-xs text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-2 border border-surface-border2 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors">
              <Settings size={15} /> Settings
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-surface-2 border border-surface-border2 rounded-xl text-sm text-zinc-400 hover:text-red-400 transition-colors">
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>

        {/* Credits card */}
        <div className="relative mt-6 p-4 rounded-xl border border-brand-orange/20 bg-brand-orange/5 flex items-center gap-4">
          <Zap size={20} className="text-brand-orange flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-600 text-white">{profile.credits} credits remaining</p>
            <p className="text-xs text-zinc-500">Each song generation costs 5 credits</p>
          </div>
          {profile.plan === 'free' && (
            <button className="px-4 py-2 bg-brand-gradient text-white text-xs font-700 rounded-lg hover:opacity-90 transition-opacity">
              Get Pro
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-8 py-4 border-b border-surface-border">
        {[
          { key: 'songs', icon: Music2, label: `Songs (${completedSongs.length})` },
          { key: 'liked', icon: Heart, label: `Liked (${likedSongs.length})` },
        ].map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setActiveTab(key as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-500 transition-all',
              activeTab === key
                ? 'bg-surface-3 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            )}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Songs */}
      <div className="px-4 py-4">
        {activeTab === 'songs' && (
          <div>
            {songs.length === 0 ? (
              <div className="text-center py-20">
                <Music2 size={40} className="text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 font-600">No songs yet</p>
                <p className="text-zinc-600 text-sm mt-1">Head to Create to generate your first song</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
                {songs.map(song => <SongCard key={song.id} song={song} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'liked' && (
          <div>
            {likedSongs.length === 0 ? (
              <div className="text-center py-20">
                <Heart size={40} className="text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 font-600">No liked songs yet</p>
                <p className="text-zinc-600 text-sm mt-1">Explore and like songs you love</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
                {likedSongs.map((song: Song) => <SongCard key={song.id} song={song} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
