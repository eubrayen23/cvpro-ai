// ============================================================
// netlify/functions/ai.js — Proxy serverless para chamadas de IA
// Mantém as chaves de API fora do bundle do frontend.
// Gemini (principal) → Groq (fallback se Gemini falhar)
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GROQ_API_KEY = process.env.GROQ_API_KEY

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'

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
    let errMsg = `status ${response.status}`
    try {
      const err = await response.json()
      errMsg = err?.error?.message || errMsg
    } catch {}
    throw new Error(`Gemini erro: ${errMsg}`)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('Gemini retornou uma resposta vazia ou filtrada.')
  }
  return text
}

async function callGroq(systemPrompt, userPrompt) {
  const response = await fetch(GROQ_ENDPOINT, {
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
    let errMsg = `status ${response.status}`
    try {
      const err = await response.json()
      errMsg = err?.error?.message || errMsg
    } catch {}
    throw new Error(`Groq erro: ${errMsg}`)
  }

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content
  if (!text) {
    throw new Error('Groq retornou uma resposta vazia.')
  }
  return text
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido' }) }
  }

  if (!GEMINI_API_KEY && !GROQ_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Chaves de IA não configuradas no servidor.' })
    }
  }

  let systemPrompt, userPrompt
  try {
    const body = JSON.parse(event.body || '{}')
    systemPrompt = body.systemPrompt
    userPrompt = body.userPrompt
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Corpo do pedido inválido.' }) }
  }

  if (!systemPrompt || !userPrompt) {
    return { statusCode: 400, body: JSON.stringify({ error: 'systemPrompt e userPrompt são obrigatórios.' }) }
  }

  try {
    let text
    try {
      text = await callGemini(systemPrompt, userPrompt)
    } catch (geminiError) {
      text = await callGroq(systemPrompt, userPrompt)
    }
    return { statusCode: 200, body: JSON.stringify({ text }) }
  } catch {
    return {
      statusCode: 503,
      body: JSON.stringify({ error: 'Serviço de IA temporariamente indisponível. Tenta novamente.' })
    }
  }
}
