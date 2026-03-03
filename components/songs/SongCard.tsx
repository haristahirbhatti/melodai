'use client'
import { useState } from 'react'
import { usePlayerStore } from '@/lib/store'
import { formatDuration, formatRelativeTime, getGradientFromId } from '@/lib/utils'
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import type { Song } from '@/types'
import { cn } from '@/lib/utils'

interface SongCardProps {
  song: Song
  showUpgrade?: boolean
  onLike?: (songId: string) => void
}

export function SongCard({ song, showUpgrade, onLike }: SongCardProps) {
  const { currentSong, playing, setCurrentSong, setPlaying, queue } = usePlayerStore()
  const isActive = currentSong?.id === song.id
  const gradient = getGradientFromId(song.id)
  const [liked, setLiked] = useState(song.liked || false)

  const handlePlay = () => {
    if (song.status !== 'completed') return
    if (isActive) {
      setPlaying(!playing)
    } else {
      setCurrentSong(song)
      setPlaying(true)
    }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(!liked)
    onLike?.(song.id)
  }

  const statusIcon = {
    pending: <Loader2 size={12} className="spin text-zinc-500" />,
    processing: <Loader2 size={12} className="spin text-brand-orange processing-pulse" />,
    completed: null,
    failed: <XCircle size={12} className="text-red-500" />,
  }[song.status]

  return (
    <div
      onClick={handlePlay}
      className={cn(
        'flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer group animate-in',
        isActive ? 'bg-surface-3' : 'hover:bg-surface-2',
        song.status !== 'completed' && 'opacity-70 cursor-default'
      )}
    >
      {/* Cover */}
      <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden" style={{
        background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`
      }}>
        {song.cover_url && (
          <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
        )}

        {/* Duration badge */}
        {song.duration && (
          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-600 px-1.5 py-0.5 rounded">
            {formatDuration(song.duration)}
          </div>
        )}

        {/* Playing indicator */}
        {isActive && playing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-0.5">
            {[0, 0.1, 0.2, 0.3, 0.4].map((d, i) => (
              <div key={i} className="wave-bar w-0.5 rounded-sm" style={{
                height: 14, background: 'linear-gradient(to top, #f97316, #ef4444)',
                animationDelay: `${d}s`
              }} />
            ))}
          </div>
        )}

        {/* Status overlay */}
        {song.status === 'processing' && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
            <Loader2 size={20} className="spin text-brand-orange" />
            <span className="text-[9px] text-brand-orange font-600">Generating</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-600 text-white truncate">{song.title}</span>
          {statusIcon}
          <span className={cn(
            'text-[10px] px-2 py-0.5 rounded-full font-600 border flex-shrink-0',
            song.model_version === 'chirp-v4'
              ? 'bg-purple-950/50 text-purple-400 border-purple-800/50'
              : 'bg-surface-4 text-zinc-500 border-surface-border2'
          )}>
            {song.model_version === 'chirp-v4' ? 'v5 Preview' : 'v4.5-all'}
          </span>
        </div>

        <p className="text-xs text-zinc-500 truncate mb-2 leading-relaxed">
          {song.genre || song.prompt}
        </p>

        {song.lyrics && (
          <p className="text-[11px] text-emerald-400/70 italic truncate mb-2">
            "{song.lyrics.split('\n')[0]}"
          </p>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              liked ? 'text-brand-orange' : 'text-zinc-600 hover:text-zinc-300'
            )}
          >
            <ThumbsUp size={13} />
          </button>
          <button className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-300 transition-colors">
            <ThumbsDown size={13} />
          </button>
          <button className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-300 transition-colors">
            <Share2 size={13} />
          </button>
          <span className="text-[10px] text-zinc-700 ml-1">{formatRelativeTime(song.created_at)}</span>
        </div>
      </div>

      {/* Upgrade CTA */}
      {showUpgrade && song.status === 'completed' && (
        <button
          onClick={e => e.stopPropagation()}
          className="flex-shrink-0 text-xs font-700 text-black bg-white px-3 py-2 rounded-full hover:bg-zinc-200 transition-colors"
        >
          Full song
        </button>
      )}

      <button
        onClick={e => e.stopPropagation()}
        className="flex-shrink-0 text-zinc-600 hover:text-zinc-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
      >
        <MoreHorizontal size={16} />
      </button>
    </div>
  )
}
