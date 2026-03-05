'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SongCard } from '@/components/songs/SongCard'
import { TopBar } from '@/components/layout/TopBar'
import type { Song, Profile } from '@/types'
import { cn } from '@/lib/utils'
import { Music2, Heart, LogOut, Crown, Zap, Camera, Check, Loader2, Share2 } from 'lucide-react'

interface Props { profile: Profile; songs: Song[]; likedSongs: Song[] }

export function ProfileClient({ profile, songs, likedSongs }: Props) {
  const [activeTab, setActiveTab] = useState<'songs' | 'liked'>('songs')
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState(profile.username || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ username }).eq('id', profile.id)
    if (!error) { setSaved(true); setEditing(false); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${profile.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', profile.id)
      setAvatarUrl(data.publicUrl)
    } catch (err) { console.error('Avatar upload failed:', err) }
    setAvatarUploading(false)
  }

  const handleShare = () => {
    navigator.share?.({ title: 'My HmongSuav Profile', url: window.location.href }) ||
      navigator.clipboard.writeText(window.location.href)
  }

  const completedSongs = songs.filter(s => s.status === 'completed')
  const totalPlays = songs.reduce((acc, s) => acc + s.play_count, 0)

  return (
    <div className="h-full overflow-y-auto">
      <TopBar />

      {/* Profile header */}
      <div className="relative px-4 lg:px-8 pt-6 lg:pt-10 pb-6 lg:pb-8 border-b border-surface-border">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, #f97316 0%, transparent 60%)' }} />

        <div className="relative flex flex-col sm:flex-row items-start gap-4 lg:gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-brand-gradient-h flex items-center justify-center text-2xl font-800 overflow-hidden">
              {avatarUrl
                ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                : (profile.full_name || profile.username || 'U')[0]?.toUpperCase()
              }
            </div>
            <button onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-surface-3 border border-surface-border2 flex items-center justify-center hover:bg-surface-4 transition-colors">
              {avatarUploading ? <Loader2 size={13} className="spin text-brand-orange" /> : <Camera size={13} className="text-zinc-400" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            {profile.plan === 'pro' && (
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center">
                <Crown size={12} className="text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2 mb-2">
                <input value={username} onChange={e => setUsername(e.target.value)}
                  className="bg-surface-2 border border-brand-orange/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  placeholder="Username" />
                <button onClick={handleSaveProfile} disabled={saving}
                  className="px-3 py-2 bg-brand-gradient text-white text-xs font-600 rounded-lg flex items-center gap-1.5">
                  {saving ? <Loader2 size={13} className="spin" /> : <Check size={13} />}
                  Save
                </button>
                <button onClick={() => setEditing(false)} className="px-3 py-2 bg-surface-2 text-zinc-400 text-xs rounded-lg">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="font-display font-800 text-xl lg:text-2xl">{profile.full_name || profile.username || 'Music Creator'}</h1>
                {profile.plan === 'pro' && <span className="text-xs px-2 py-0.5 rounded-full bg-brand-orange/10 border border-brand-orange/30 text-brand-orange font-600">PRO</span>}
                {saved && <span className="text-xs text-emerald-400">✓ Saved</span>}
              </div>
            )}
            <p className="text-zinc-500 text-sm mb-3">@{profile.username || profile.id.slice(0, 8)}</p>

            {/* Stats */}
            <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
              {[
                { label: 'Songs', value: completedSongs.length },
                { label: 'Plays', value: totalPlays },
                { label: 'Liked', value: likedSongs.length },
                { label: 'Credits', value: profile.credits },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-base lg:text-lg font-700 text-white">{value}</p>
                  <p className="text-xs text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 self-start">
            <button onClick={() => setEditing(!editing)} className="px-3 py-2 bg-surface-2 border border-surface-border2 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors">
              Edit Profile
            </button>
            <button onClick={handleShare} className="p-2 bg-surface-2 border border-surface-border2 rounded-xl text-zinc-400 hover:text-white transition-colors">
              <Share2 size={15} />
            </button>
            <button onClick={handleLogout} className="p-2 bg-surface-2 border border-surface-border2 rounded-xl text-zinc-400 hover:text-red-400 transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Credits bar */}
        <div className="relative mt-5 p-3 lg:p-4 rounded-xl border border-brand-orange/20 bg-brand-orange/5 flex items-center gap-3">
          <Zap size={18} className="text-brand-orange flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-600 text-white">{profile.credits} credits remaining</p>
            <div className="mt-1.5 h-1.5 bg-surface-4 rounded-full">
              <div className="h-full bg-brand-gradient-h rounded-full transition-all" style={{ width: `${Math.min((profile.credits / 100) * 100, 100)}%` }} />
            </div>
          </div>
          {profile.plan === 'free' && (
            <a href="/pro" className="px-3 py-2 bg-brand-gradient text-white text-xs font-700 rounded-lg hover:opacity-90 flex-shrink-0">
              Get Pro
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 lg:px-8 py-3 border-b border-surface-border">
        {[
          { key: 'songs', icon: Music2, label: `Songs (${completedSongs.length})` },
          { key: 'liked', icon: Heart, label: `Liked (${likedSongs.length})` },
        ].map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setActiveTab(key as any)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-500 transition-all', activeTab === key ? 'bg-surface-3 text-white' : 'text-zinc-500 hover:text-zinc-300')}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Songs list */}
      <div className="px-2 lg:px-4 py-4">
        {activeTab === 'songs' && (
          songs.length === 0 ? (
            <div className="text-center py-20">
              <Music2 size={40} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 font-600">No songs yet</p>
              <a href="/create" className="mt-4 inline-block px-6 py-2.5 bg-brand-gradient text-white text-sm font-600 rounded-full">Create Song</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4">
              {songs.map(song => <SongCard key={song.id} song={song} />)}
            </div>
          )
        )}
        {activeTab === 'liked' && (
          likedSongs.length === 0 ? (
            <div className="text-center py-20">
              <Heart size={40} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 font-600">No liked songs yet</p>
              <a href="/explore" className="mt-4 inline-block px-6 py-2.5 bg-surface-2 border border-surface-border2 text-white text-sm font-600 rounded-full">Explore Songs</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4">
              {likedSongs.map((song: Song) => <SongCard key={song.id} song={song} />)}
            </div>
          )
        )}
      </div>
    </div>
  )
}
