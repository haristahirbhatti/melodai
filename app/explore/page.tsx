import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { ExploreClient } from './ExploreClient'

export default async function ExplorePage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  // Fetch public songs
  const { data: songs } = await supabase
    .from('songs')
    .select('*, profiles(username, full_name, avatar_url)')
    .eq('is_public', true)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(60)

  // Fetch liked songs for the user
  let likedIds: string[] = []
  if (user) {
    const { data: likes } = await supabase
      .from('likes')
      .select('song_id')
      .eq('user_id', user.id)
    likedIds = likes?.map(l => l.song_id) || []
  }

  const songsWithLikes = (songs || []).map(s => ({ ...s, liked: likedIds.includes(s.id) }))

  return (
    <AppShell profile={profile}>
      <ExploreClient songs={songsWithLikes} />
    </AppShell>
  )
}
