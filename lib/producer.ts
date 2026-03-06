const BASE_URL = 'https://api.ttapi.io'

export interface ProducerGenerateParams {
  prompt: string
  tags?: string
  instrumental?: boolean
  model?: string
  title?: string
  lyrics?: string
}

export async function generateMusic(params: ProducerGenerateParams, apiKey: string): Promise<{ jobId: string }> {
  let body: any

  if (params.lyrics && params.lyrics.trim()) {
    // ── CUSTOM MODE ──
    // User ne lyrics diye → TTAPI custom=true → exact lyrics sing karega
    // tags = style (genre, mood, voice) — directly Suno style field mein jaata hai
    body = {
      mv: 'chirp-v4',
      custom: true,
      instrumental: params.instrumental || false,
      title: params.title || 'My Song',
      tags: params.tags || '',   // ← "Hmong vocals, sad, acoustic" — Suno ka style field
      prompt: params.lyrics,     // ← exact lyrics
    }
  } else {
    // ── SIMPLE MODE ──
    // Bina lyrics — TTAPI custom=false → AI apni lyrics banata hai
    // Yahan tags ko gpt_description_prompt mein strongly embed karo
    const tagStr = params.tags || ''
    const userDesc = params.prompt || ''

    // Format: "jazz, sad, male vocals song. [user description]"
    // Suno is format ko best follow karta hai
    const description = tagStr
      ? `${tagStr} song${userDesc ? `. ${userDesc}` : ''}`
      : userDesc

    body = {
      mv: 'chirp-v4',
      custom: false,
      instrumental: params.instrumental || false,
      gpt_description_prompt: description,
    }
  }

  console.log('── TTAPI REQUEST ──')
  console.log('Mode:', params.lyrics ? 'CUSTOM (user lyrics)' : 'SIMPLE (AI lyrics)')
  console.log('Instrumental:', params.instrumental)
  console.log('Tags/Style:', params.tags)
  console.log('Body:', JSON.stringify(body).slice(0, 400))

  const res = await fetch(`${BASE_URL}/suno/v1/music`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'TT-API-KEY': apiKey,
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  console.log('TTAPI Status:', res.status)
  console.log('TTAPI Response:', text.slice(0, 300))

  if (!res.ok) throw new Error(`TTAPI error ${res.status}: ${text}`)

  const data = JSON.parse(text)
  const jobId = data?.data?.jobId || data.jobId || data.task_id || data.id
  if (!jobId) throw new Error(`No jobId in response: ${text}`)

  return { jobId }
}

export async function getTaskStatus(jobId: string, apiKey: string) {
  const res = await fetch(`${BASE_URL}/suno/v1/fetch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'TT-API-KEY': apiKey,
    },
    body: JSON.stringify({ jobId }),
  })

  const text = await res.text()
  console.log('TTAPI Fetch:', res.status, text.slice(0, 300))
  if (!res.ok) throw new Error(`TTAPI fetch error: ${text}`)
  return JSON.parse(text)
}