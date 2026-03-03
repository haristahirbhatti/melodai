'use client'
import { useState, useEffect } from 'react'
import { SongCard } from '@/components/songs/SongCard'
import { usePlayerStore } from '@/lib/store'
import type { Song } from '@/types'
import { Search, TrendingUp, Clock, Heart, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const GENRES = ['All', 'Bollywood', 'Lo-fi', 'Synthwave', 'Hip Hop', 'Classical', 'Jazz', 'Folk', 'Electronic', 'R&B']
const SORT_OPTIONS = [
  { icon: Clock, label: 'Newest', value: 'newest' },
  { icon: TrendingUp, label: 'Trending', value: 'trending' },
  { icon: Heart, label: 'Most Liked', value: 'liked' },
]

interface Props { songs: Song[] }

export function ExploreClient({ songs }: Props) {
  const [search, setSearch] = useState('')
  const [activeGenre, setActiveGenre] = useState('All')
  const [sort, setSort] = useState('newest')
  const { setQueue } = usePlayerStore()

  useEffect(() => { setQueue(songs) }, [songs])

  const filtered = songs.filter(s => {
    const matchSearch = !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.genre?.toLowerCase().includes(search.toLowerCase()) ||
      s.profiles?.username?.toLowerCase().includes(search.toLowerCase())
    const matchGenre = activeGenre === 'All' || s.genre?.toLowerCase().includes(activeGenre.toLowerCase()) || s.tags.some(t => t.toLowerCase().includes(activeGenre.toLowerCase()))
    return matchSearch && matchGenre
  })

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-surface-border flex-shrink-0">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="font-display font-800 text-2xl mb-1">Explore</h1>
            <p className="text-zinc-500 text-sm">Discover AI-generated music from the community</p>
          </div>
          <div className="flex items-center gap-2">
            {SORT_OPTIONS.map(({ icon: Icon, label, value }) => (
              <button key={value} onClick={() => setSort(value)} className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-500 transition-all border',
                sort === value
                  ? 'bg-surface-3 border-surface-border2 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              )}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-surface-2 border border-surface-border2 rounded-xl px-4 py-3 mb-4 max-w-md focus-within:border-brand-orange/50 transition-colors">
          <Search size={15} className="text-zinc-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search songs, genres, artists..."
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
          />
        </div>

        {/* Genre filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {GENRES.map(genre => (
            <button key={genre} onClick={() => setActiveGenre(genre)} className={cn(
              'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-600 transition-all border',
              activeGenre === genre
                ? 'bg-brand-orange/10 border-brand-orange/50 text-brand-orange'
                : 'border-surface-border2 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
            )}>{genre}</button>
          ))}
        </div>
      </div>

      {/* Songs grid */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Zap size={40} className="text-zinc-700 mb-4" />
            <p className="text-zinc-400 font-600 mb-1">No songs found</p>
            <p className="text-zinc-600 text-sm">Try a different search or genre filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
            {filtered.map(song => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
