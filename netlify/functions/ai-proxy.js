// Netlify serverless function — proxies AI requests so API keys stay server-side.
// Keys are read from Netlify environment variables (NOT prefixed with VITE_).

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GROQ_API_KEY = process.env.GROQ_API_KEY

const MAX_PROMPT_LENGTH = 5000

function sanitizePrompt(text) {
  if (typeof text !== 'string') return ''
  return text.slice(0, MAX_PROMPT_LENGTH)
}

async function callGemini(systemPrompt, userPrompt) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(`Gemini error ${response.status}: ${err?.error?.message || 'Unknown'}`)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

async function callGroq(systemPrompt, userPrompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1024
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(`Groq error ${response.status}: ${err?.error?.message || 'Unknown'}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  if (!GEMINI_API_KEY && !GROQ_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'AI service not configured' }) }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { systemPrompt, userPrompt } = body
  if (!systemPrompt || !userPrompt) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing systemPrompt or userPrompt' }) }
  }

  const sanitizedSystem = sanitizePrompt(systemPrompt)
  const sanitizedUser = sanitizePrompt(userPrompt)

  try {
    let result
    try {
      result = await callGemini(sanitizedSystem, sanitizedUser)
    } catch (geminiError) {
      if (!GROQ_API_KEY) throw geminiError
      result = await callGroq(sanitizedSystem, sanitizedUser)
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result })
    }
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'AI service temporarily unavailable' })
    }
  }
}
