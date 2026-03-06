import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function downloadAndUpload(supabase: any, url: string, bucket: string, path: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    const { error } = await supabase.storage.from(bucket).upload(path, buffer, { contentType, upsert: true })
    if (error) return null
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  } catch { return null }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    console.log('KieAI Callback:', JSON.stringify(body).slice(0, 500))

    const taskId = body?.taskId || body?.data?.taskId
    const status = body?.status || body?.data?.status
    const songs = body?.data?.sunoData || body?.sunoData || []

    if (!taskId) return NextResponse.json({ ok: true })

    if (status === 'SUCCESS' && songs.length > 0) {
      const song = songs[0]

      // Save permanently to Supabase Storage
      const [audioUrl, coverUrl] = await Promise.all([
        song.audioUrl ? downloadAndUpload(supabase, song.audioUrl, 'audio', `${taskId}.mp3`) : null,
        song.imageUrl ? downloadAndUpload(supabase, song.imageUrl, 'covers', `${taskId}.jpg`) : null,
      ])

      await supabase.from('songs').update({
        status: 'completed',
        audio_url: audioUrl || song.audioUrl,
        cover_url: coverUrl || song.imageUrl,
        title: song.title || 'My Song',
        duration: song.duration ? Math.floor(song.duration) : null,
        is_public: true,
      }).eq('producer_task_id', taskId)

      console.log('✅ Song saved via callback:', taskId)
    } else if (status === 'FAILED') {
      await supabase.from('songs').update({ status: 'failed' }).eq('producer_task_id', taskId)
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Callback error:', error)
    return NextResponse.json({ ok: true }) // always return 200 to kie.ai
  }
}