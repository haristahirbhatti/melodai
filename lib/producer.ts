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
    // CUSTOM MODE — user ne lyrics diye hain
    // TTAPI custom=true mode mein exact lyrics use karta hai (just like Suno)
    body = {
      mv: params.model || 'chirp-v3-5',
      custom: true,
      instrumental: params.instrumental || false,
      title: params.title || 'My Song',
      tags: params.tags || '',   // genre/style tags
      prompt: params.lyrics,     // custom=true mein prompt = lyrics
    }
  } else {
    // SIMPLE MODE — sirf description se generate karo
    const description = params.tags
      ? `${params.tags}, ${params.prompt}`
      : params.prompt

    body = {
      mv: params.model || 'chirp-v3-5',
      custom: false,
      instrumental: params.instrumental || false,
      gpt_description_prompt: description,
    }
  }

  console.log('TTAPI Request mode:', params.lyrics ? 'CUSTOM (with lyrics)' : 'SIMPLE')
  console.log('TTAPI Request body:', JSON.stringify(body).slice(0, 300))

  const res = await fetch(`${BASE_URL}/suno/v1/music`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'TT-API-KEY': apiKey,
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  console.log('TTAPI Response status:', res.status)
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