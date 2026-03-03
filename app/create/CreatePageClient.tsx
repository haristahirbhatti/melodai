'use client'
import { useState, useEffect, useCallback } from 'react'
import { SongCard } from '@/components/songs/SongCard'
import { usePlayerStore } from '@/lib/store'
import { INSPIRATION_TAGS, MODEL_VERSIONS, cn } from '@/lib/utils'
import type { Song, Profile } from '@/types'
import {
  Plus, Music2, FileText, Mic2, Trash2, Search,
  SlidersHorizontal, ArrowUpDown, Info, ChevronUp, ChevronDown
} from 'lucide-react'

interface Props {
  initialSongs: Song[]
  profile: Profile
}

export function CreatePageClient({ initialSongs, profile }: Props) {
  const [prompt, setPrompt] = useState('')
  const [tab, setTab] = useState<'Simple' | 'Custom'>('Simple')
  const [instrumental, setInstrumental] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [modelVersion, setModelVersion] = useState('chirp-v3-5')
  const [generating, setGenerating] = useState(false)
  const [songs, setSongs] = useState<Song[]>(initialSongs)
  const [searchQuery, setSearchQuery] = useState('')
  const [showChallenge, setShowChallenge] = useState(true)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [credits, setCredits] = useState(profile.credits)

  const { setQueue } = usePlayerStore()

  // Poll pending/processing songs
  useEffect(() => {
    const pending = songs.filter(s => s.status === 'processing' || s.status === 'pending')
    if (pending.length === 0) return

    const interval = setInterval(async () => {
      for (const song of pending) {
        if (!song.producer_task_id) continue
        try {
          const res = await fetch(`/api/songs/${song.producer_task_id}`)
          const data = await res.json()
          if (data.status === 'completed' && data.song) {
            setSongs(prev => prev.map(s => s.id === song.id ? data.song : s))
          } else if (data.status === 'failed') {
            setSongs(prev => prev.map(s => s.id === song.id ? { ...s, status: 'failed' } : s))
          }
        } catch {}
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [songs])

  useEffect(() => {
    const completed = songs.filter(s => s.status === 'completed')
    setQueue(completed)
  }, [songs])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return

    setGenerating(true)
    setStatusMessage(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tags: selectedTags, instrumental, model_version: modelVersion })
      })

      const data = await res.json()

      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Generation failed' })
        return
      }

      setSongs(prev => [data.song, ...prev])
      setCredits(c => c - 5)
      setPrompt('')
      setSelectedTags([])
      setStatusMessage({ type: 'success', text: `"${data.song.title}" is being generated...` })
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Network error. Please try again.' })
    }

    setGenerating(false)
  }

  const filteredSongs = songs.filter(s =>
    !searchQuery ||
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.genre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full">
      {/* CREATE PANEL */}
      <div className="w-[460px] flex-shrink-0 border-r border-surface-border flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-border">
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <Music2 size={15} />
            <span className="text-brand-orange font-600">{credits}</span>
            <span className="text-zinc-600">credits</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Simple / Custom tabs */}
            <div className="flex bg-surface-2 rounded-full p-1 gap-1">
              {(['Simple', 'Custom'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-600 transition-all',
                  tab === t ? 'bg-surface-3 text-white' : 'text-zinc-500 hover:text-zinc-300'
                )}>{t}</button>
              ))}
            </div>
            {/* Model version */}
            <select
              value={modelVersion}
              onChange={e => setModelVersion(e.target.value)}
              className="bg-surface-2 border border-surface-border2 text-zinc-400 text-xs px-3 py-2 rounded-full cursor-pointer focus:outline-none"
            >
              {MODEL_VERSIONS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main prompt area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Prompt textarea */}
          <div className="relative bg-surface-2 rounded-xl p-4 border border-surface-border2 focus-within:border-brand-orange/50 transition-colors">
            <p className="text-xs text-zinc-500 font-500 mb-2">Song Description</p>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate() }}
              placeholder="Describe the song you want to create...&#10;e.g. A melancholic Urdu ghazal about lost love, male vocals, acoustic guitar"
              rows={5}
              className="w-full bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none leading-relaxed"
            />
            <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center hover:opacity-90 transition-opacity">
              <span className="text-white text-sm">✨</span>
            </button>
            <p className="text-[10px] text-zinc-700 mt-2">⌘+Enter to generate</p>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-border2 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors text-xs">
              <Plus size={13} /> Audio
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-border2 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors text-xs">
              <FileText size={13} /> Lyrics
            </button>
            <button
              onClick={() => setInstrumental(!instrumental)}
              className={cn(
                'ml-auto flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all',
                instrumental
                  ? 'border-brand-orange/50 bg-brand-orange/10 text-brand-orange'
                  : 'border-surface-border2 text-zinc-500 hover:text-zinc-300'
              )}
            >
              <div className={cn(
                'w-7 h-4 rounded-full relative transition-colors',
                instrumental ? 'bg-brand-orange' : 'bg-surface-4'
              )}>
                <div className={cn(
                  'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all',
                  instrumental ? 'left-3.5' : 'left-0.5'
                )} />
              </div>
              Instrumental
            </button>
          </div>

          {/* Inspiration tags */}
          <div>
            <p className="text-xs text-zinc-500 font-500 mb-3">Inspiration</p>
            <div className="flex flex-wrap gap-2">
              {INSPIRATION_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)} className={cn(
                  'px-3 py-1.5 rounded-full border text-xs transition-all',
                  selectedTags.includes(tag)
                    ? 'border-brand-orange/60 bg-brand-orange/10 text-brand-orange'
                    : 'border-surface-border2 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                )}>{tag}</button>
              ))}
            </div>
          </div>

          {/* Status messages */}
          {statusMessage && (
            <div className={cn(
              'px-4 py-3 rounded-xl text-xs animate-in border',
              statusMessage.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-900/50 text-emerald-400'
                : 'bg-red-950/50 border-red-900/50 text-red-400'
            )}>
              {statusMessage.text}
            </div>
          )}
        </div>

        {/* Create button */}
        <div className="px-5 py-4 border-t border-surface-border flex gap-3">
          <button
            onClick={() => { setPrompt(''); setSelectedTags([]); setStatusMessage(null) }}
            className="w-11 h-11 rounded-xl bg-surface-2 border border-surface-border2 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim() || credits < 5}
            className="flex-1 h-11 rounded-xl bg-brand-gradient text-white font-700 text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin" />
                Generating...
              </>
            ) : (
              <><Music2 size={16} /> Create</>
            )}
          </button>
        </div>
      </div>

      {/* WORKSPACE PANEL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-1 px-6 py-4 border-b border-surface-border flex-shrink-0">
          <span className="text-zinc-500 text-sm">Workspaces</span>
          <span className="text-zinc-700 text-sm mx-1">›</span>
          <span className="text-white text-sm font-600">My Workspace</span>
        </div>

        {/* Search & filters */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-surface-border flex-shrink-0">
          <div className="flex-1 flex items-center gap-2 bg-surface-2 border border-surface-border2 rounded-xl px-3 py-2.5">
            <Search size={14} className="text-zinc-600" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search your songs..."
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2.5 bg-surface-2 border border-surface-border2 rounded-xl text-zinc-400 text-xs hover:text-white transition-colors">
            <SlidersHorizontal size={13} /> Filters
          </button>
          <button className="flex items-center gap-2 px-3 py-2.5 bg-surface-2 border border-surface-border2 rounded-xl text-zinc-400 text-xs hover:text-white transition-colors">
            <ArrowUpDown size={13} /> Newest
          </button>
        </div>

        {/* Songs list */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {filteredSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
                <Music2 size={28} className="text-zinc-600" />
              </div>
              <p className="text-zinc-400 font-600 mb-1">No songs yet</p>
              <p className="text-zinc-600 text-sm">Create your first song using the panel on the left</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSongs.map(song => (
                <SongCard key={song.id} song={song} showUpgrade={profile.plan === 'free'} />
              ))}
            </div>
          )}
        </div>

        {/* Challenge banner */}
        {showChallenge && (
          <div className="mx-4 mb-3 px-4 py-3 bg-surface-1 border border-surface-border rounded-xl flex items-center gap-4 flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-surface-3 border border-surface-border2 flex items-center justify-center text-xs font-700 text-zinc-400 flex-shrink-0">
              0/5
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-600">Challenges</span>
                <Info size={12} className="text-zinc-600" />
              </div>
              <p className="text-xs text-zinc-500">
                Earn <span className="text-brand-orange font-600">50 credits</span> per challenge completed
              </p>
            </div>
            <span className="text-emerald-400 font-700 text-sm flex-shrink-0">22:46</span>
            <button
              onClick={() => setShowChallenge(false)}
              className="text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
