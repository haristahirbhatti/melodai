import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTaskStatus } from '@/lib/producer'

export async function GET(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const apiKey = process.env.PRODUCER_AI_API_KEY!
    const { taskId } = params

    const task = await getTaskStatus(taskId, apiKey)
    console.log('Poll result for', taskId, ':', JSON.stringify(task).slice(0, 200))

    // TTAPI returns status: SUCCESS / PENDING / PROCESSING
    if (task.status === 'SUCCESS' && task.data?.musics?.[0]) {
      const music = task.data.musics[0]

      const { data: song } = await supabase
        .from('songs')
        .update({
          status: 'completed',
          audio_url: music.audioUrl,
          cover_url: music.imageUrl,
          title: music.title || 'My Song',
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
      await supabase
        .from('songs')
        .update({ status: 'failed' })
        .eq('producer_task_id', taskId)
        .eq('user_id', user.id)

      return NextResponse.json({ status: 'failed', error: task.error })
    }

    // Still processing
    return NextResponse.json({ status: 'processing' })

  } catch (error: any) {
    console.error('Poll error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
