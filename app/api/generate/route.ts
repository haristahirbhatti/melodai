import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMusic } from '@/lib/producer'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { prompt, title, lyrics, tags = [], instrumental = false } = body

    if (!prompt?.trim() && !lyrics?.trim() && !title?.trim() && tags.length === 0) {
      return NextResponse.json({ error: 'Please add a title, lyrics, tags or description' }, { status: 400 })
    }

    const apiKey = process.env.PRODUCER_AI_API_KEY
    if (!apiKey || apiKey === 'your_key_here') {
      return NextResponse.json({ error: 'PRODUCER_AI_API_KEY not set' }, { status: 503 })
    }

    const songTitle = title || 'My Song'

    const { data: song, error: songError } = await supabase
      .from('songs')
      .insert({
        user_id: user.id,
        title: songTitle,
        prompt: prompt || '',
        lyrics: lyrics || null,
        tags,
        model_version: 'chirp-v4',   // always v4
        status: 'pending',
        is_public: false,
      })
      .select()
      .single()

    if (songError || !song) {
      console.error('Song insert error:', songError)
      return NextResponse.json({ error: 'Failed to create song' }, { status: 500 })
    }

    try {
      const { jobId } = await generateMusic({
        prompt: prompt || '',
        title: songTitle,
        lyrics: lyrics || '',
        tags: tags.join(', '),      // "Hmong folk, sad ballad, acoustic"
        instrumental,
        model: 'chirp-v4',
      }, apiKey)

      console.log('TTAPI jobId:', jobId)

      const { data: deducted } = await supabase.rpc('deduct_credits', { user_id: user.id, amount: 5 })
      if (!deducted) {
        await supabase.from('songs').update({ status: 'failed' }).eq('id', song.id)
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
      }

      await supabase.from('songs').update({ status: 'processing', producer_task_id: jobId }).eq('id', song.id)

      return NextResponse.json({
        song: { ...song, status: 'processing', producer_task_id: jobId },
        jobId,
        message: lyrics
          ? `🎵 Generating with your lyrics in ${tags.join(', ') || 'auto'} style...`
          : `🎵 Generating ${tags.join(', ') || ''} song...`,
      })
    } catch (err: any) {
      console.error('TTAPI call failed:', err.message)
      await supabase.from('songs').delete().eq('id', song.id)
      return NextResponse.json({ error: 'Generation failed: ' + err.message }, { status: 503 })
    }
  } catch (error: any) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}