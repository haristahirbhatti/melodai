const BASE_URL = 'https://api.kie.ai'

export interface ProducerGenerateParams {
  prompt: string
  tags?: string
  instrumental?: boolean
  model?: string
  title?: string
  lyrics?: string
}

export async function generateMusic(params: ProducerGenerateParams, apiKey: string, appUrl: string): Promise<{ jobId: string }> {
  let body: any

  const callBackUrl = `${appUrl}/api/callback/kie`

  if (params.lyrics && params.lyrics.trim()) {
    body = {
      prompt: params.lyrics,
      title: params.title || 'My Song',
      style: params.tags || '',
      customMode: true,
      instrumental: params.instrumental || false,
      model: 'V4_5',
      callBackUrl,
    }
  } else {
    const description = params.tags
      ? `${params.tags} song. ${params.prompt || ''}`
      : params.prompt || ''

    body = {
      prompt: description,
      customMode: false,
      instrumental: params.instrumental || false,
      model: 'V4_5',
      callBackUrl,
    }
  }

  console.log('KieAI Request:', JSON.stringify(body).slice(0, 400))

  const res = await fetch(`${BASE_URL}/api/v1/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  console.log('KieAI Status:', res.status)
  console.log('KieAI Response:', text.slice(0, 300))

  if (!res.ok) throw new Error(`KieAI error ${res.status}: ${text}`)

  const data = JSON.parse(text)
  const jobId = data?.data?.taskId || data.taskId
  if (!jobId) throw new Error(`No taskId in response: ${text}`)

  return { jobId }
}

export async function getTaskStatus(jobId: string, apiKey: string) {
  const res = await fetch(`${BASE_URL}/api/v1/generate/record-info?taskId=${jobId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  const text = await res.text()
  console.log('KieAI Poll:', res.status, text.slice(0, 300))
  if (!res.ok) throw new Error(`KieAI poll error: ${text}`)

  const data = JSON.parse(text)
  const taskData = data?.data

  if (taskData?.status === 'SUCCESS') {
    const songs = taskData?.response?.sunoData || []
    return {
      status: 'SUCCESS',
      data: {
        musics: songs.map((s: any) => ({
          musicId: s.id,
          title: s.title || 'My Song',
          tags: s.tags || '',
          audioUrl: s.audioUrl,
          imageUrl: s.imageUrl,
          duration: s.duration,
          lyrics: s.prompt || null,
        }))
      }
    }
  }

  if (taskData?.status === 'FAILED' || taskData?.errorCode) {
    return { status: 'FAILED', error: taskData?.errorMessage || 'Generation failed' }
  }

  return { status: 'PROCESSING' }
}