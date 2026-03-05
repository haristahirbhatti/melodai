'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import { usePlayerStore } from '@/lib/store'
import { formatDuration, getGradientFromId } from '@/lib/utils'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react'

export function PlayerBar() {
  const { currentSong, playing, progress, volume, setPlaying, setProgress, setVolume, playNext, playPrev } = usePlayerStore()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!currentSong?.audio_url) return
    if (!audioRef.current) audioRef.current = new Audio()
    audioRef.current.src = currentSong.audio_url
    audioRef.current.volume = volume / 100
    if (playing) audioRef.current.play().catch(() => {})
  }, [currentSong])

  useEffect(() => {
    if (!audioRef.current) return
    if (playing) audioRef.current.play().catch(() => {})
    else audioRef.current.pause()
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
    return () => { audio.removeEventListener('timeupdate', onTimeUpdate); audio.removeEventListener('ended', onEnded) }
  }, [])

  const handleProgressClick = useCallback((e: React.MouseEvent) => {
    if (!progressBarRef.current || !audioRef.current || !currentSong?.duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const newTime = Math.floor(((e.clientX - rect.left) / rect.width) * currentSong.duration)
    audioRef.current.currentTime = newTime
    setProgress(newTime)
  }, [currentSong])

  if (!currentSong) return null

  const duration = currentSong.duration || 60
  const progressPct = Math.min((progress / duration) * 100, 100)
  const gradient = getGradientFromId(currentSong.id)

  return (
    <div className={`bg-surface-1 border-t border-surface-border flex-shrink-0 transition-all duration-300 ${expanded ? 'h-auto' : ''}`}>
      {/* Expanded mobile view */}
      {expanded && (
        <div className="lg:hidden p-6 flex flex-col items-center gap-4 border-b border-surface-border">
          <div className="w-48 h-48 rounded-2xl" style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}>
            {currentSong.cover_url && <img src={currentSong.cover_url} alt="" className="w-full h-full rounded-2xl object-cover" />}
          </div>
          <div className="text-center">
            <p className="font-700 text-lg text-white">{currentSong.title}</p>
            <p className="text-sm text-zinc-500">{currentSong.genre}</p>
          </div>
        </div>
      )}

      {/* Main player bar */}
      <div className="h-16 lg:h-[72px] flex items-center px-4 lg:px-6 gap-3 lg:gap-4">
        {/* Track info */}
        <div className="flex items-center gap-2.5 w-32 lg:w-56 flex-shrink-0 min-w-0">
          <div className="w-10 h-10 rounded-lg flex-shrink-0 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}>
            {currentSong.cover_url && <img src={currentSong.cover_url} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs lg:text-sm font-semibold truncate text-white">{currentSong.title}</p>
            <p className="text-[10px] lg:text-xs text-zinc-500 truncate">{currentSong.genre?.split(',')[0] || 'Unknown'}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-3 lg:gap-5">
            <button onClick={playPrev} className="text-zinc-500 hover:text-white transition-colors hidden sm:block">
              <SkipBack size={16} />
            </button>
            <button onClick={() => setPlaying(!playing)}
              className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform">
              {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>
            <button onClick={playNext} className="text-zinc-500 hover:text-white transition-colors hidden sm:block">
              <SkipForward size={16} />
            </button>
          </div>
          {/* Progress bar */}
          <div className="w-full flex items-center gap-2">
            <span className="text-[10px] text-zinc-600 w-7 text-right tabular-nums hidden sm:block">{formatDuration(progress)}</span>
            <div ref={progressBarRef} onClick={handleProgressClick}
              className="flex-1 h-1 bg-surface-4 rounded-full cursor-pointer group relative">
              <div className="h-full rounded-full bg-brand-gradient-h" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-[10px] text-zinc-600 w-7 tabular-nums hidden sm:block">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Volume - desktop only */}
          <div className="hidden lg:flex items-center gap-2">
            <button onClick={() => setVolume(volume === 0 ? 80 : 0)} className="text-zinc-500 hover:text-white transition-colors">
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(Number(e.target.value))}
              className="w-20 accent-brand-orange cursor-pointer" />
          </div>
          {/* Expand toggle - mobile only */}
          <button onClick={() => setExpanded(!expanded)} className="lg:hidden text-zinc-500 hover:text-white transition-colors">
            {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
