'use client'
import { useState, useEffect } from 'react'
import { SongCard } from '@/components/songs/SongCard'
import { usePlayerStore } from '@/lib/store'
import { TopBar } from '@/components/layout/TopBar'
import { INSPIRATION_TAGS, MODEL_VERSIONS, cn } from '@/lib/utils'
import type { Song, Profile } from '@/types'
import { Music2, FileText, Trash2, Search, SlidersHorizontal, Info, ChevronDown, Sparkles } from 'lucide-react'

interface Props { initialSongs: Song[]; profile: Profile }

export function CreatePageClient({ initialSongs, profile }: Props) {
  const [title, setTitle] = useState('')
  const [lyrics, setLyrics] = useState('')
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
  const [showCreate, setShowCreate] = useState(true)
  const { setQueue } = usePlayerStore()

  // Poll processing songs every 4s
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
            setStatusMessage({ type: 'success', text: `"${data.song.title}" is ready! 🎵` })
          } else if (data.status === 'failed') {
            setSongs(prev => prev.map(s => s.id === song.id ? { ...s, status: 'failed' } : s))
          }
        } catch {}
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [songs])

  useEffect(() => {
    setQueue(songs.filter(s => s.status === 'completed'))
  }, [songs])

  const toggleTag = (tag: string) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])

  // Build enriched prompt from all inputs
  const buildPrompt = () => {
    const parts: string[] = []
    if (selectedTags.length > 0) parts.push(`Style: ${selectedTags.join(', ')}`)
    if (title) parts.push(`Song title: ${title}`)
    if (prompt) parts.push(prompt)
    if (lyrics) parts.push(`Lyrics:\n${lyrics}`)
    return parts.join('\n')
  }

  const handleGenerate = async () => {
    const fullPrompt = buildPrompt()
    if (!fullPrompt.trim() || generating) return
    setGenerating(true)
    setStatusMessage(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          title,
          lyrics,
          tags: selectedTags,
          instrumental,
          model_version: modelVersion
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Generation failed' })
        return
      }
      setSongs(prev => [data.song, ...prev])
      setCredits(c => c - 5)
      setPrompt('')
      setTitle('')
      setLyrics('')
      setSelectedTags([])
      setStatusMessage({ type: 'success', text: '🎵 Generating your song... (30-60 seconds)' })
      setShowCreate(false)
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error. Please try again.' })
    }
    setGenerating(false)
  }

  const hasInput = title || lyrics || prompt || selectedTags.length > 0

  const filteredSongs = songs.filter(s =>
    !searchQuery ||
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <TopBar />

      {/* Mobile tab switcher */}
      <div className="lg:hidden flex border-b border-surface-border flex-shrink-0">
        <button onClick={() => setShowCreate(true)} className={cn('flex-1 py-3 text-sm font-600 transition-colors border-b-2', showCreate ? 'text-white border-brand-orange' : 'text-zinc-500 border-transparent')}>
          ✨ Create
        </button>
        <button onClick={() => setShowCreate(false)} className={cn('flex-1 py-3 text-sm font-600 transition-colors border-b-2 relative', !showCreate ? 'text-white border-brand-orange' : 'text-zinc-500 border-transparent')}>
          🎵 My Songs
          {songs.filter(s => s.status === 'processing').length > 0 && (
            <span className="absolute top-2 right-6 w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
          )}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── CREATE PANEL ── */}
        <div className={cn(
          'border-r border-surface-border flex flex-col',
          'w-full lg:w-[480px] lg:flex-shrink-0',
          showCreate ? 'flex' : 'hidden lg:flex'
        )}>
          {/* Desktop header */}
          <div className="hidden lg:flex items-center gap-3 px-5 py-4 border-b border-surface-border">
            <div className="flex items-center gap-2 text-sm">
              <Music2 size={15} className="text-zinc-500" />
              <span className="text-brand-orange font-600">{credits}</span>
              <span className="text-zinc-600">credits</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex bg-surface-2 rounded-full p-1">
                {(['Simple', 'Custom'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-1.5 rounded-full text-xs font-600 transition-all', tab === t ? 'bg-surface-3 text-white' : 'text-zinc-500 hover:text-zinc-300')}>{t}</button>
                ))}
              </div>
              <select value={modelVersion} onChange={e => setModelVersion(e.target.value)}
                className="bg-surface-2 border border-surface-border2 text-zinc-400 text-xs px-3 py-2 rounded-full cursor-pointer focus:outline-none">
                {MODEL_VERSIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>

          {/* Form fields */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-3">

            {/* ── 1. TITLE ── */}
            <div className="bg-surface-2 rounded-xl px-4 pt-3 pb-3 border border-surface-border2 focus-within:border-brand-orange/50 transition-colors">
              <p className="text-xs text-zinc-500 font-500 mb-2">Song Title</p>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Goodbye (So goodbye...)"
                className="w-full bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>

            {/* ── 2. LYRICS ── */}
            <div className="bg-surface-2 rounded-xl px-4 pt-3 pb-3 border border-surface-border2 focus-within:border-brand-orange/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500 font-500">Lyrics</p>
                <span className="text-[10px] text-zinc-700">{lyrics.length} chars</span>
              </div>
              <textarea
                value={lyrics}
                onChange={e => setLyrics(e.target.value)}
                placeholder={`Paste your lyrics here...\n\nVerse 1:\n...\n\nChorus:\n...`}
                rows={8}
                className="w-full bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none leading-relaxed font-mono"
              />
            </div>

            {/* ── 3. SONG DESCRIPTION ── */}
            <div className="relative bg-surface-2 rounded-xl px-4 pt-3 pb-3 border border-surface-border2 focus-within:border-brand-orange/50 transition-colors">
              <p className="text-xs text-zinc-500 font-500 mb-2">Song Description <span className="text-zinc-700">(optional)</span></p>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate() }}
                placeholder="Describe the style, mood, instruments... e.g. Sad Hmong ballad with acoustic guitar, slow tempo, emotional male vocals"
                rows={3}
                className="w-full bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none leading-relaxed"
              />
              <p className="text-[10px] text-zinc-700 mt-1">⌘+Enter to generate</p>
            </div>

            {/* ── Controls row ── */}
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setInstrumental(!instrumental)} className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all',
                instrumental ? 'border-brand-orange/50 bg-brand-orange/10 text-brand-orange' : 'border-surface-border2 text-zinc-500 hover:text-zinc-300'
              )}>
                <div className={cn('w-7 h-4 rounded-full relative transition-colors', instrumental ? 'bg-brand-orange' : 'bg-surface-4')}>
                  <div className={cn('absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all', instrumental ? 'left-3.5' : 'left-0.5')} />
                </div>
                Instrumental
              </button>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-zinc-600">
                <FileText size={12} />
                <span>{selectedTags.length > 0 ? `${selectedTags.length} styles selected` : 'Pick styles below'}</span>
              </div>
            </div>

            {/* ── 4. INSPIRATION TAGS ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs text-zinc-500 font-500">Inspiration</p>
                <span className="text-[10px] text-zinc-700 bg-surface-3 px-2 py-0.5 rounded-full">
                  These styles will guide the AI generation
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {INSPIRATION_TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)} className={cn(
                    'px-3 py-1.5 rounded-full border text-xs transition-all flex items-center gap-1.5',
                    selectedTags.includes(tag)
                      ? 'border-brand-orange/60 bg-brand-orange/10 text-brand-orange'
                      : 'border-surface-border2 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  )}>
                    {selectedTags.includes(tag) && <Sparkles size={10} />}
                    {tag}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="mt-3 px-3 py-2 bg-brand-orange/5 border border-brand-orange/20 rounded-lg">
                  <p className="text-[11px] text-brand-orange">
                    ✨ AI will generate in: <span className="font-600">{selectedTags.join(' · ')}</span> style
                  </p>
                </div>
              )}
            </div>

            {/* Status message */}
            {statusMessage && (
              <div className={cn('px-4 py-3 rounded-xl text-xs animate-in border', statusMessage.type === 'success' ? 'bg-emerald-950/50 border-emerald-900/50 text-emerald-400' : 'bg-red-950/50 border-red-900/50 text-red-400')}>
                {statusMessage.text}
              </div>
            )}
          </div>

          {/* ── Create Button ── */}
          <div className="px-4 lg:px-5 py-3 lg:py-4 border-t border-surface-border flex gap-3">
            <button onClick={() => { setPrompt(''); setTitle(''); setLyrics(''); setSelectedTags([]); setStatusMessage(null) }}
              className="w-11 h-11 rounded-xl bg-surface-2 border border-surface-border2 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0">
              <Trash2 size={16} />
            </button>
            <button onClick={handleGenerate} disabled={generating || !hasInput || credits < 5}
              className="flex-1 h-11 rounded-xl bg-brand-gradient text-white font-700 text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40">
              {generating
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin" /> Generating...</>
                : <><Music2 size={16} /> Create Song</>
              }
            </button>
          </div>
        </div>

        {/* ── WORKSPACE PANEL ── */}
        <div className={cn('flex-1 flex flex-col min-w-0 overflow-hidden', !showCreate ? 'flex' : 'hidden lg:flex')}>
          <div className="hidden lg:flex items-center gap-1 px-6 py-4 border-b border-surface-border flex-shrink-0">
            <span className="text-zinc-500 text-sm">Workspaces</span>
            <span className="text-zinc-700 text-sm mx-1">›</span>
            <span className="text-white text-sm font-600">My Workspace</span>
          </div>

          <div className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b border-surface-border flex-shrink-0">
            <div className="flex-1 flex items-center gap-2 bg-surface-2 border border-surface-border2 rounded-xl px-3 py-2.5">
              <Search size={14} className="text-zinc-600" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search songs..."
                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none" />
            </div>
            <button className="hidden sm:flex items-center gap-2 px-3 py-2.5 bg-surface-2 border border-surface-border2 rounded-xl text-zinc-400 text-xs">
              <SlidersHorizontal size={13} /> Filters
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 lg:px-4 py-3">
            {filteredSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
                  <Music2 size={28} className="text-zinc-600" />
                </div>
                <p className="text-zinc-400 font-600 mb-1">No songs yet</p>
                <p className="text-zinc-600 text-sm">Add a title, lyrics & description then hit Create!</p>
                <button onClick={() => setShowCreate(true)} className="mt-4 px-6 py-2.5 bg-brand-gradient text-white text-sm font-600 rounded-full lg:hidden">
                  Start Creating
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredSongs.map(song => <SongCard key={song.id} song={song} showUpgrade={profile.plan === 'free'} onDelete={(id) => setSongs(prev => prev.filter(s => s.id !== id))} />)}
              </div>
            )}
          </div>

          {showChallenge && (
            <div className="mx-4 mb-3 px-4 py-3 bg-surface-1 border border-surface-border rounded-xl flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-surface-3 border border-surface-border2 flex items-center justify-center text-xs font-700 text-zinc-400 flex-shrink-0">0/5</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-600">Challenges</span>
                  <Info size={12} className="text-zinc-600" />
                </div>
                <p className="text-xs text-zinc-500">Earn <span className="text-brand-orange font-600">50 credits</span> per challenge</p>
              </div>
              <button onClick={() => setShowChallenge(false)} className="text-zinc-600 hover:text-zinc-400 flex-shrink-0">
                <ChevronDown size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
