import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTaskStatus } from '@/lib/producer'

async function downloadAndUpload(supabase: any, url: string, path: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'application/octet-stream'

    const { error } = await supabase.storage
      .from(path.startsWith('audio') ? 'audio' : 'covers')
      .upload(path, buffer, { contentType, upsert: true })

    if (error) { console.error('Upload error:', error); return null }

    const { data } = supabase.storage
      .from(path.startsWith('audio') ? 'audio' : 'covers')
      .getPublicUrl(path)

    return data.publicUrl
  } catch (err) {
    console.error('Download/upload failed:', err)
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const apiKey = process.env.PRODUCER_AI_API_KEY!
    const { taskId } = params

    const task = await getTaskStatus(taskId, apiKey)
    console.log('Poll result:', JSON.stringify(task).slice(0, 200))

    if (task.status === 'SUCCESS' && task.data?.musics?.[0]) {
      const music = task.data.musics[0]

      // Download and permanently store in Supabase Storage
      console.log('Saving audio to Supabase...')
      const audioPath = `${user.id}/${taskId}.mp3`
      const coverPath = `${user.id}/${taskId}.jpg`

      const [permanentAudioUrl, permanentCoverUrl] = await Promise.all([
        music.audioUrl ? downloadAndUpload(supabase, music.audioUrl, `audio/${audioPath}`) : null,
        music.imageUrl ? downloadAndUpload(supabase, music.imageUrl, `covers/${coverPath}`) : null,
      ])

      console.log('Permanent audio URL:', permanentAudioUrl)
      console.log('Permanent cover URL:', permanentCoverUrl)

      const { data: song } = await supabase
        .from('songs')
        .update({
          status: 'completed',
          audio_url: permanentAudioUrl || music.audioUrl,
          cover_url: permanentCoverUrl || music.imageUrl,
          title: music.title || 'My Song',
          lyrics: music.lyrics || null,
          duration: music.duration ? Math.floor(music.duration) : null,
          is_public: true,
        })
        .eq('producer_task_id', taskId)
        .eq('user_id', user.id)
        .select()
        .single()

      return NextResponse.json({ status: 'completed', song })
    }

    if (task.status === 'FAILED') {
      await supabase.from('songs').update({ status: 'failed' }).eq('producer_task_id', taskId).eq('user_id', user.id)
      return NextResponse.json({ status: 'failed' })
    }

    return NextResponse.json({ status: 'processing' })

  } catch (error: any) {
    console.error('Poll error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}