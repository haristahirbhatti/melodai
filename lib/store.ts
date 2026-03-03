'use client'
import { create } from 'zustand'
import type { Song, Profile } from '@/types'

interface PlayerState {
  currentSong: Song | null
  queue: Song[]
  playing: boolean
  progress: number
  volume: number
  setCurrentSong: (song: Song) => void
  setQueue: (songs: Song[]) => void
  setPlaying: (playing: boolean) => void
  setProgress: (progress: number) => void
  setVolume: (volume: number) => void
  playNext: () => void
  playPrev: () => void
}

interface AppState {
  profile: Profile | null
  sidebarOpen: boolean
  setProfile: (profile: Profile | null) => void
  setSidebarOpen: (open: boolean) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  queue: [],
  playing: false,
  progress: 0,
  volume: 80,
  setCurrentSong: (song) => set({ currentSong: song, progress: 0 }),
  setQueue: (songs) => set({ queue: songs }),
  setPlaying: (playing) => set({ playing }),
  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => set({ volume }),
  playNext: () => {
    const { queue, currentSong } = get()
    if (!currentSong || queue.length === 0) return
    const idx = queue.findIndex(s => s.id === currentSong.id)
    const next = queue[idx + 1] || queue[0]
    set({ currentSong: next, progress: 0 })
  },
  playPrev: () => {
    const { queue, currentSong } = get()
    if (!currentSong || queue.length === 0) return
    const idx = queue.findIndex(s => s.id === currentSong.id)
    const prev = queue[idx - 1] || queue[queue.length - 1]
    set({ currentSong: prev, progress: 0 })
  },
}))

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  sidebarOpen: true,
  setProfile: (profile) => set({ profile }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
