import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMusic } from '@/lib/producer'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, tags = [], instrumental = false, model_version = 'chirp-v3-5' } = body

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const apiKey = process.env.PRODUCER_AI_API_KEY
    if (!apiKey || apiKey === 'your_key_here') {
      return NextResponse.json({ error: 'PRODUCER_AI_API_KEY not set' }, { status: 503 })
    }

    // Create pending song FIRST (no credits deducted yet)
    const { data: song, error: songError } = await supabase
      .from('songs')
      .insert({
        user_id: user.id,
        title: 'Generating...',
        prompt,
        tags,
        model_version,
        status: 'pending',
        is_public: false,
      })
      .select()
      .single()

    if (songError || !song) {
      console.error('Song insert error:', songError)
      return NextResponse.json({ error: 'Failed to create song' }, { status: 500 })
    }

    // Call TTAPI
    try {
      const { jobId } = await generateMusic({
        prompt,
        tags: tags.join(', '),
        instrumental,
        model: model_version,
      }, apiKey)

      console.log('TTAPI jobId:', jobId)

      // Only deduct credits AFTER successful API call
      const { data: deducted } = await supabase
        .rpc('deduct_credits', { user_id: user.id, amount: 5 })

      if (!deducted) {
        // Not enough credits — mark failed and return error
        await supabase.from('songs').update({ status: 'failed' }).eq('id', song.id)
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
      }

      await supabase
        .from('songs')
        .update({ status: 'processing', producer_task_id: jobId })
        .eq('id', song.id)

      return NextResponse.json({
        song: { ...song, status: 'processing', producer_task_id: jobId },
        jobId,
        message: 'Song generation started!',
      })
    } catch (err: any) {
      console.error('TTAPI call failed:', err.message)
      // Delete the pending song on failure — no credits wasted
      await supabase.from('songs').delete().eq('id', song.id)
      return NextResponse.json({
        error: 'Generation failed: ' + err.message
      }, { status: 503 })
    }

  } catch (error: any) {
    console.error('Generate route error:', error)
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 })
  }
}