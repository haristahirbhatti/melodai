export type Plan = 'free' | 'pro' | 'enterprise'
export type SongStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  credits: number
  plan: Plan
  created_at: string
  updated_at: string
}

export interface Song {
  id: string
  user_id: string
  title: string
  prompt: string
  genre: string | null
  mood: string | null
  tempo: string | null
  tags: string[]
  lyrics: string | null
  audio_url: string | null
  cover_url: string | null
  duration: number | null
  model_version: string
  status: SongStatus
  is_public: boolean
  producer_task_id: string | null
  play_count: number
  like_count: number
  created_at: string
  updated_at: string
  // joined
  profiles?: Profile
  liked?: boolean
}

export interface Like {
  id: string
  user_id: string
  song_id: string
  created_at: string
}

export interface GenerateRequest {
  prompt: string
  tags: string[]
  instrumental: boolean
  model_version: string
}

export interface GenerateResponse {
  song: Song
  task_id: string
}
