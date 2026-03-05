'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Music2, Github, Chrome, Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

function AuthForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [redirect, setRedirect] = useState('/create')

  useEffect(() => {
    if (searchParams.get('signup') === '1') setMode('signup')
    setRedirect(searchParams.get('redirect') || '/create')
  }, [searchParams])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        })
        if (error) throw error
        setSuccess('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push(redirect)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}` }
    })
    if (error) setError(error.message)
    setOauthLoading(null)
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4" style={{ height: '100vh' }}>
      {/* Background orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-10 pointer-events-none rounded-full"
        style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center">
              <Music2 size={20} className="text-white" />
            </div>
            <span className="font-display font-800 text-2xl tracking-wider">HMONGSUAV</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-surface-1 border border-surface-border rounded-2xl p-8">
          <h1 className="font-display font-700 text-2xl mb-1 text-center">
            {mode === 'login' ? 'Welcome back' : 'Get started free'}
          </h1>
          <p className="text-zinc-500 text-sm text-center mb-8">
            {mode === 'login' ? 'Sign in to your account' : 'Create your HmongSuav account'}
          </p>

          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface-2 border border-surface-border2 rounded-xl text-sm font-500 hover:bg-surface-3 transition-colors disabled:opacity-50"
            >
              {oauthLoading === 'google' ? <Loader2 size={16} className="spin" /> : <Chrome size={16} />}
              Continue with Google
            </button>
            <button
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface-2 border border-surface-border2 rounded-xl text-sm font-500 hover:bg-surface-3 transition-colors disabled:opacity-50"
            >
              {oauthLoading === 'github' ? <Loader2 size={16} className="spin" /> : <Github size={16} />}
              Continue with GitHub
            </button>
          </div>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-surface-border2" />
            <span className="text-xs text-zinc-600">or</span>
            <div className="flex-1 h-px bg-surface-border2" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-500 text-zinc-400 mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full px-4 py-3 bg-surface-2 border border-surface-border2 rounded-xl text-sm text-white placeholder-zinc-600 focus:border-brand-orange focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-500 text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={8}
                  className="w-full px-4 py-3 pr-12 bg-surface-2 border border-surface-border2 rounded-xl text-sm text-white placeholder-zinc-600 focus:border-brand-orange focus:outline-none transition-colors"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-950/50 border border-red-900/50 rounded-xl text-xs text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="px-4 py-3 bg-emerald-950/50 border border-emerald-900/50 rounded-xl text-xs text-emerald-400">
                {success}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-brand-gradient text-white font-700 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 size={15} className="spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-5">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
              className="text-brand-orange hover:underline font-600"
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}
