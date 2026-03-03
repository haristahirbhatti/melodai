'use client'
import { useEffect, useRef, useCallback } from 'react'
import { usePlayerStore } from '@/lib/store'
import { formatDuration, getGradientFromId } from '@/lib/utils'
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX
} from 'lucide-react'

function WaveBar({ delay, playing }: { delay: number; playing: boolean }) {
  return (
    <div
      className={playing ? 'wave-bar' : ''}
      style={{
        width: 3, borderRadius: 2, flexShrink: 0,
        background: 'linear-gradient(to top, #f97316, #ef4444)',
        height: playing ? 16 : 4,
        animationDelay: `${delay}s`,
        transition: 'height 0.2s ease',
      }}
    />
  )
}

export function PlayerBar() {
  const {
    currentSong, playing, progress, volume, queue,
    setPlaying, setProgress, setVolume, playNext, playPrev
  } = usePlayerStore()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Sync audio element
  useEffect(() => {
    if (!currentSong?.audio_url) return
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
    audioRef.current.src = currentSong.audio_url
    audioRef.current.volume = volume / 100
    if (playing) audioRef.current.play().catch(() => {})
  }, [currentSong])

  useEffect(() => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [playing])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume / 100
  }, [volume])

  useEffect(() => {
    if (!audioRef.current) return
    const audio = audioRef.current

    const onTimeUpdate = () => setProgress(Math.floor(audio.currentTime))
    const onEnded = () => { playNext(); setPlaying(true) }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const handleProgressClick = useCallback((e: React.MouseEvent) => {
    if (!progressBarRef.current || !audioRef.current || !currentSong?.duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    const newTime = Math.floor(ratio * currentSong.duration)
    audioRef.current.currentTime = newTime
    setProgress(newTime)
  }, [currentSong])

  const duration = currentSong?.duration || 60
  const progressPct = (progress / duration) * 100

  const gradient = currentSong ? getGradientFromId(currentSong.id) : ['#1a1a1a', '#333']

  return (
    <div className="h-[72px] bg-surface-1 border-t border-surface-border flex items-center px-6 gap-4 flex-shrink-0">
      {/* Current track */}
      <div className="flex items-center gap-3 w-56 flex-shrink-0 min-w-0">
        {currentSong ? (
          <>
            <div className="w-11 h-11 rounded-lg flex-shrink-0 relative" style={{
              background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`
            }}>
              {currentSong.cover_url && (
                <img src={currentSong.cover_url} alt="" className="w-11 h-11 rounded-lg object-cover" />
              )}
              {playing && (
                <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center gap-0.5">
                  {[0, 0.15, 0.3, 0.45, 0.6].map((d, i) => (
                    <WaveBar key={i} delay={d} playing={playing} />
                  ))}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-white">{currentSong.title}</p>
              <p className="text-xs text-zinc-500 truncate">{currentSong.profiles?.username || 'You'}</p>
            </div>
          </>
        ) : (
          <div className="text-zinc-600 text-sm">No song playing</div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="flex items-center gap-5">
          <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
            <Shuffle size={16} />
          </button>
          <button onClick={playPrev} className="text-zinc-500 hover:text-white transition-colors">
            <SkipBack size={18} />
          </button>
          <button
            onClick={() => setPlaying(!playing)}
            disabled={!currentSong}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform disabled:opacity-40"
          >
            {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>
          <button onClick={playNext} className="text-zinc-500 hover:text-white transition-colors">
            <SkipForward size={18} />
          </button>
          <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
            <Repeat size={16} />
          </button>
        </div>

        {/* Progress */}
        <div className="w-full flex items-center gap-3">
          <span className="text-xs text-zinc-600 w-8 text-right tabular-nums">
            {formatDuration(progress)}
          </span>
          <div
            ref={progressBarRef}
            onClick={handleProgressClick}
            className="flex-1 h-1 bg-surface-4 rounded-full cursor-pointer group relative"
          >
            <div
              className="h-full rounded-full bg-brand-gradient-h transition-all"
              style={{ width: `${progressPct}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
              style={{ left: `calc(${progressPct}% - 6px)` }}
            />
          </div>
          <span className="text-xs text-zinc-600 w-8 tabular-nums">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-3 w-36 flex-shrink-0 justify-end">
        <button
          onClick={() => setVolume(volume === 0 ? 80 : 0)}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          {volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
        <input
          type="range" min={0} max={100} value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          className="w-20 h-1 accent-brand-orange cursor-pointer"
        />
      </div>
    </div>
  )
}
