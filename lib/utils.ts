import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export function getGradientFromId(id: string): [string, string] {
  const gradients: [string, string][] = [
    ['#c0392b', '#8e44ad'],
    ['#1a1a2e', '#e94560'],
    ['#0f3460', '#533483'],
    ['#f39c12', '#e74c3c'],
    ['#27ae60', '#2980b9'],
    ['#6c3483', '#1a5276'],
    ['#784212', '#1b2631'],
    ['#0e6655', '#1f618d'],
  ]
  const index = id.charCodeAt(0) % gradients.length
  return gradients[index]
}

export const INSPIRATION_TAGS = [
  'Hmong folk', 'Bollywood', 'lo-fi chill', 'R&B soul', 'acoustic ballad',
  'pop', 'hip hop', 'synthwave', 'jazz', 'classical',
  'country', 'indie folk', 'dark trap', 'ambient', 'electronic',
  'sad ballad', 'upbeat', 'romantic', 'traditional', 'modern',
]

export const MODEL_VERSIONS = [
  { value: 'chirp-v3-5', label: 'v4.5-all' },
  { value: 'chirp-v4', label: 'v5 Preview' },
]