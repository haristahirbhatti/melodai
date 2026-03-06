import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Music2, Zap, Globe, Headphones, ArrowRight, Star } from 'lucide-react'

const FEATURES = [
  { icon: Zap, title: 'Instant Generation', desc: 'Create full songs in under 60 seconds from a simple text prompt' },
  { icon: Globe, title: 'Any Genre', desc: 'From Bollywood to synthwave, jazz to trap — any style, any mood' },
  { icon: Headphones, title: 'Studio Quality', desc: 'AI-powered production with professional-grade audio output' },
]

const DEMO_SONGS = [
  { title: 'Bewafa Dil Se', genre: 'Hindi Heartbreak Ballad', colors: ['#c0392b', '#8e44ad'] },
  { title: 'Neon Nights', genre: 'Synthwave Electronic', colors: ['#0f3460', '#e94560'] },
  { title: 'Desert Wind', genre: 'Punjabi Folk Fusion', colors: ['#f39c12', '#e74c3c'] },
  { title: 'City of Glass', genre: 'Lo-fi Chill Hop', colors: ['#27ae60', '#2980b9'] },
]

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-surface text-white overflow-y-auto" style={{ height: '100vh' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
            <Music2 size={16} className="text-white" />
          </div>
          <span className="font-display font-800 text-lg tracking-wider">HMONGSUAB</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/explore" className="text-sm text-zinc-400 hover:text-white transition-colors">Explore</Link>
          {user ? (
            <Link href="/create" className="px-4 py-2 text-sm font-600 text-black bg-white rounded-full hover:bg-zinc-200 transition-colors">
              Open App
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm text-zinc-400 hover:text-white transition-colors">Sign in</Link>
              <Link href="/auth/login?signup=1" className="px-4 py-2 text-sm font-700 text-white bg-brand-gradient rounded-full hover:opacity-90 transition-opacity">
                Get Started Free
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center text-center pt-28 pb-20 px-8 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #f97316 0%, transparent 70%)' }} />
        <div className="absolute top-20 left-1/4 w-64 h-64 opacity-10 pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-orange/30 bg-brand-orange/10 text-xs text-brand-orange font-600 mb-6">
          <Star size={12} className="fill-brand-orange" />
          Now with v5 AI model — better than ever
        </div>

        <h1 className="font-display font-800 text-6xl leading-tight max-w-3xl mb-6">
          Create Music with{' '}
          <span className="gradient-text">AI Magic</span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-xl leading-relaxed mb-10">
          Turn your ideas into full songs in seconds. Type a description, pick a style,
          and let HmongSuab compose original music just for you.
        </p>

        <div className="flex items-center gap-4">
          <Link href={user ? '/create' : '/auth/login?signup=1'}
            className="flex items-center gap-2 px-7 py-3.5 bg-brand-gradient text-white font-700 rounded-full text-sm hover:opacity-90 transition-opacity hover-glow">
            Start Creating Free
            <ArrowRight size={16} />
          </Link>
          <Link href="/explore"
            className="flex items-center gap-2 px-7 py-3.5 border border-surface-border2 text-zinc-300 font-600 rounded-full text-sm hover:border-zinc-500 transition-colors">
            Explore Songs
          </Link>
        </div>

        <p className="text-xs text-zinc-600 mt-4">30 free credits • No credit card required</p>
      </section>

      {/* Demo songs */}
      <section className="px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-700 text-2xl text-center mb-8 text-zinc-300">
            Songs made with HmongSuab
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DEMO_SONGS.map(song => (
              <div key={song.title} className="group cursor-pointer">
                <div className="aspect-square rounded-xl mb-3 relative overflow-hidden" style={{
                  background: `linear-gradient(135deg, ${song.colors[0]}, ${song.colors[1]})`
                }}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <Music2 size={16} className="text-black" />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-600 text-white truncate">{song.title}</p>
                <p className="text-xs text-zinc-500 truncate">{song.genre}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 pb-24 border-t border-surface-border pt-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-700 text-3xl text-center mb-14">
            Why <span className="gradient-text">HmongSuab</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl bg-surface-1 border border-surface-border hover:border-surface-border2 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-brand-orange" />
                </div>
                <h3 className="font-display font-700 text-base mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 pb-20 text-center">
        <div className="max-w-lg mx-auto p-10 rounded-3xl bg-surface-1 border border-surface-border noise relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{
            background: 'radial-gradient(ellipse at center, #f97316 0%, transparent 70%)'
          }} />
          <h2 className="font-display font-800 text-3xl mb-4 relative">Ready to create?</h2>
          <p className="text-zinc-400 text-sm mb-8 relative">Join thousands of creators making original music with AI</p>
          <Link href={user ? '/create' : '/auth/login?signup=1'}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-gradient text-white font-700 rounded-full hover:opacity-90 transition-opacity relative">
            Start for Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}