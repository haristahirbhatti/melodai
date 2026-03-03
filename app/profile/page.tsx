import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { ProfileClient } from './ProfileClient'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: songs }, { data: likedSongs }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('songs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('likes').select('songs(*, profiles(username))').eq('user_id', user.id).limit(20),
  ])

  return (
    <AppShell profile={profile}>
      <ProfileClient
        profile={profile}
        songs={songs || []}
        likedSongs={(likedSongs || []).map((l: any) => l.songs).filter(Boolean)}
      />
    </AppShell>
  )
}
