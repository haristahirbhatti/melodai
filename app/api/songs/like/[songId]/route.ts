import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: { songId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { songId } = params

  // Check if already liked
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('song_id', songId)
    .single()

  if (existing) {
    // Unlike
    await supabase.from('likes').delete().eq('id', existing.id)
    await supabase.from('songs').update({ like_count: supabase.rpc('like_count') }).eq('id', songId)
    return NextResponse.json({ liked: false })
  } else {
    // Like
    await supabase.from('likes').insert({ user_id: user.id, song_id: songId })
    await supabase.from('songs').update({ like_count: supabase.rpc('like_count') }).eq('id', songId)
    return NextResponse.json({ liked: true })
  }
}
