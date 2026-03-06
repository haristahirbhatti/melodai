'use client'
import { useState, useEffect } from 'react'
import { usePlayerStore } from '@/lib/store'
import { formatDuration, formatRelativeTime, getGradientFromId } from '@/lib/utils'
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Loader2, XCircle, Trash2, X } from 'lucide-react'
import type { Song } from '@/types'
import { cn } from '@/lib/utils'

interface SongCardProps { song: Song; showUpgrade?: boolean; onDelete?: (songId: string) => void }

export function SongCard({ song, showUpgrade, onDelete }: SongCardProps) {
  const { currentSong, playing, setCurrentSong, setPlaying } = usePlayerStore()
  const isActive = currentSong?.id === song.id
  const gradient = getGradientFromId(song.id)
  const [liked, setLiked] = useState(song.liked || false)
  const [likeCount, setLikeCount] = useState(song.like_count)
  const [showMenu, setShowMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [relativeTime, setRelativeTime] = useState('')

  useEffect(() => {
    setRelativeTime(formatRelativeTime(song.created_at))
  }, [song.created_at])

  const handlePlay = () => {
    if (song.status !== 'completed' || !song.audio_url) return
    if (isActive) setPlaying(!playing)
    else { setCurrentSong(song); setPlaying(true) }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(!liked)
    setLikeCount(c => liked ? c - 1 : c + 1)
    try { await fetch(`/api/songs/like/${song.id}`, { method: 'POST' }) } catch { }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (navigator.share) await navigator.share({ title: song.title, url: window.location.origin + '/explore' })
      else { await navigator.clipboard.writeText(window.location.origin + '/explore'); alert('Link copied!') }
    } catch { }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirmDelete) { setConfirmDelete(true); setShowMenu(false); return }
    setDeleting(true)
    try {
      await fetch(`/api/songs/delete/${song.id}`, { method: 'DELETE' })
      onDelete?.(song.id)
    } catch { }
    setDeleting(false)
    setConfirmDelete(false)
  }

  const canPlay = song.status === 'completed' && !!song.audio_url

  return (
    <div className="relative">
      {/* Delete confirm overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 z-10 bg-red-950/90 rounded-xl flex items-center justify-between px-4 py-3 border border-red-900/50">
          <p className="text-sm text-red-300 font-500">Delete "{song.title}"?</p>
          <div className="flex gap-2">
            <button onClick={handleDelete} disabled={deleting}
              className="px-3 py-1.5 bg-red-500 text-white text-xs font-700 rounded-lg flex items-center gap-1.5 hover:bg-red-600">
              {deleting ? <Loader2 size={12} className="spin" /> : <Trash2 size={12} />}
              Delete
            </button>
            <button onClick={e => { e.stopPropagation(); setConfirmDelete(false) }}
              className="px-3 py-1.5 bg-surface-3 text-zinc-300 text-xs font-600 rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div onClick={handlePlay}
        className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group animate-in relative',
          canPlay ? 'cursor-pointer' : 'cursor-default',
          isActive ? 'bg-surface-3' : 'hover:bg-surface-2',
          confirmDelete && 'opacity-0'
        )}>

        {/* Cover */}
        <div className="relative flex-shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-lg overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}>
          {song.cover_url && <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />}
          {song.duration && (
            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-600 px-1 py-0.5 rounded">
              {formatDuration(song.duration)}
            </div>
          )}
          {isActive && playing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-0.5">
              {[0, 0.1, 0.2, 0.3, 0.4].map((d, i) => (
                <div key={i} className="wave-bar w-0.5 rounded-sm"
                  style={{ height: 14, background: 'linear-gradient(to top, #f97316, #ef4444)', animationDelay: `${d}s` }} />
              ))}
            </div>
          )}
          {song.status === 'processing' && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
              <Loader2 size={18} className="spin text-brand-orange" />
              <span className="text-[8px] text-brand-orange font-600">Generating</span>
            </div>
          )}
          {song.status === 'failed' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <XCircle size={20} className="text-red-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-600 text-white truncate">{song.title}</span>
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-600 border flex-shrink-0 hidden sm:block',
              song.model_version === 'chirp-v4' ? 'bg-purple-950/50 text-purple-400 border-purple-800/50' : 'bg-surface-4 text-zinc-500 border-surface-border2')}>
              {song.model_version === 'chirp-v4' ? 'v5' : 'v4.5'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 truncate mb-1.5 leading-relaxed">{song.genre || song.prompt}</p>
          {song.lyrics && (
            <p className="text-[11px] text-emerald-400/70 italic truncate mb-1.5 hidden sm:block">
              "{song.lyrics.split('\n')[0]}"
            </p>
          )}
          <div className="flex items-center gap-1">
            <button onClick={handleLike} className={cn('flex items-center gap-1 p-1.5 rounded-md transition-colors text-xs', liked ? 'text-brand-orange' : 'text-zinc-600 hover:text-zinc-300')}>
              <ThumbsUp size={12} /> {likeCount > 0 && <span>{likeCount}</span>}
            </button>
            <button onClick={e => e.stopPropagation()} className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-300 transition-colors">
              <ThumbsDown size={12} />
            </button>
            <button onClick={handleShare} className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-300 transition-colors">
              <Share2 size={12} />
            </button>
            <span className="text-[10px] text-zinc-700 ml-1 hidden sm:block">{relativeTime}</span>
          </div>
        </div>

        {showUpgrade && song.status === 'completed' && (
          <a href="/pro" onClick={e => e.stopPropagation()}
            className="flex-shrink-0 text-xs font-700 text-black bg-white px-2.5 py-1.5 rounded-full hover:bg-zinc-200 transition-colors hidden sm:block">
            Full song
          </a>
        )}

        {/* More menu button */}
        <div className="relative flex-shrink-0">
          <button onClick={e => { e.stopPropagation(); setShowMenu(!showMenu) }}
            className="text-zinc-600 hover:text-zinc-400 transition-colors opacity-0 group-hover:opacity-100 p-1">
            <MoreHorizontal size={15} />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 bottom-8 bg-surface-3 border border-surface-border2 rounded-xl shadow-xl z-20 py-1 min-w-[140px]"
              onClick={e => e.stopPropagation()}>
              <button onClick={handleShare} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-zinc-300 hover:bg-surface-4 hover:text-white transition-colors">
                <Share2 size={13} /> Share song
              </button>
              <div className="h-px bg-surface-border mx-2 my-1" />
              <button onClick={handleDelete}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-400 hover:bg-red-950/50 transition-colors">
                <Trash2 size={13} /> Delete song
              </button>
              <button onClick={e => { e.stopPropagation(); setShowMenu(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-zinc-500 hover:bg-surface-4 transition-colors">
                <X size={13} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}