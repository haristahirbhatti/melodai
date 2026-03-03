const BASE_URL = 'https://api.ttapi.io'

export interface ProducerGenerateParams {
  prompt: string
  tags?: string
  instrumental?: boolean
  model?: string
}

export async function generateMusic(params: ProducerGenerateParams, apiKey: string): Promise<{ jobId: string }> {
  // When custom=false, TTAPI needs gpt_description_prompt (not prompt)
  const description = params.tags
    ? `${params.tags}, ${params.prompt}`
    : params.prompt

  const body = {
    mv: params.model || 'chirp-v3-5',
    custom: false,
    instrumental: params.instrumental || false,
    gpt_description_prompt: description,
  }

  console.log('TTAPI Request:', JSON.stringify(body))

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
  console.log('TTAPI Response body:', text)

  if (!res.ok) {
    throw new Error(`TTAPI error ${res.status}: ${text}`)
  }

  const data = JSON.parse(text)
  const jobId = data?.data?.jobId || data.jobId || data.task_id || data.id

  if (!jobId) {
    throw new Error(`No jobId in response: ${text}`)
  }

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