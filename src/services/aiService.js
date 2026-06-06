// ============================================================
// aiService.js — Serviço central de IA com fallback automático
// Gemini (principal) → Groq (fallback se Gemini falhar)
// ============================================================

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
const GROQ_ENDPOINT = `https://api.groq.com/openai/v1/chat/completions`

// ─── Chamada ao Gemini ──────────────────────────────────────
async function callGemini(systemPrompt, userPrompt) {
  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(`Gemini erro ${response.status}: ${err?.error?.message || 'Desconhecido'}`)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

// ─── Chamada ao Groq (fallback) ─────────────────────────────
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
    const err = await response.json()
    throw new Error(`Groq erro ${response.status}: ${err?.error?.message || 'Desconhecido'}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// ─── Função principal com fallback automático ───────────────
async function callAI(systemPrompt, userPrompt) {
  try {
    console.log('[AI] A usar Gemini...')
    const result = await callGemini(systemPrompt, userPrompt)
    console.log('[AI] Gemini respondeu com sucesso.')
    return result
  } catch (geminiError) {
    console.warn('[AI] Gemini falhou, a mudar para Groq...', geminiError.message)
    try {
      const result = await callGroq(systemPrompt, userPrompt)
      console.log('[AI] Groq respondeu com sucesso (fallback).')
      return result
    } catch (groqError) {
      console.error('[AI] Ambas APIs falharam.', groqError.message)
      throw new Error('Serviço de IA temporariamente indisponível. Tenta novamente.')
    }
  }
}

// ============================================================
// FUNÇÕES ESPECÍFICAS POR SECÇÃO DO CV
// ============================================================

const SYSTEM_BASE = `
És um especialista em recursos humanos e redação de CVs profissionais para o mercado angolano e africano.
Escreves sempre em português formal (variante angolana/europeia).
Os teus textos são concisos, impactantes, orientados para resultados e otimizados para sistemas ATS.
Nunca inventas informações — apenas melhoras o que o utilizador fornece.
Responde APENAS com o texto pedido, sem introduções, explicações ou comentários.
`

// ─── 1. Gerar/melhorar resumo profissional ──────────────────
export async function gerarResumoProfissional(dadosUtilizador) {
  const { nome, cargo, anos_experiencia, sector, competencias, objetivo } = dadosUtilizador
  
  const userPrompt = `
Gera um resumo profissional impactante para um CV com estes dados:
- Nome: ${nome}
- Cargo actual/pretendido: ${cargo}
- Anos de experiência: ${anos_experiencia}
- Sector: ${sector}
- Principais competências: ${competencias}
- Objectivo profissional: ${objetivo || 'progressão de carreira'}

O resumo deve ter 3-4 frases, ser orientado para resultados, e destacar o valor que o candidato traz.
Formato: texto corrido, sem bullet points.
`

  return await callAI(SYSTEM_BASE, userPrompt)
}

// ─── 2. Melhorar descrição de experiência ──────────────────
export async function melhorarExperiencia(experiencia) {
  const { cargo, empresa, descricao_raw, sector } = experiencia
  
  const userPrompt = `
Melhora esta descrição de experiência profissional para um CV:
- Cargo: ${cargo}
- Empresa: ${empresa}
- Sector: ${sector}
- Descrição actual (bruta): ${descricao_raw}

Reescreve em 3-5 bullet points com verbos de acção fortes (Liderou, Implementou, Reduziu, Aumentou, etc.).
Adiciona percentagens ou métricas onde fizer sentido contextualmente.
Formato: cada bullet começa com "• ".
`

  return await callAI(SYSTEM_BASE, userPrompt)
}

// ─── 3. Sugerir competências por sector ─────────────────────
export async function sugerirCompetencias(cargo, sector) {
  const userPrompt = `
Para um profissional com o cargo "${cargo}" no sector "${sector}" em Angola/África,
lista 10 competências técnicas (hard skills) e 5 competências transversais (soft skills) relevantes.

Formato JSON:
{
  "hard_skills": ["skill1", "skill2", ...],
  "soft_skills": ["skill1", "skill2", ...]
}

Responde APENAS com o JSON, sem mais nada.
`

  const resultado = await callAI(SYSTEM_BASE, userPrompt)
  try {
    return JSON.parse(resultado.replace(/```json|```/g, '').trim())
  } catch {
    return { hard_skills: [], soft_skills: [] }
  }
}

// ─── 4. Otimizar CV para oferta de emprego específica ──────
export async function otimizarParaVaga(cvData, descricaoVaga) {
  const userPrompt = `
Analisa este CV e esta oferta de emprego, e sugere melhorias para aumentar compatibilidade ATS:

CV (resumo):
${JSON.stringify(cvData, null, 2)}

Oferta de emprego:
${descricaoVaga}

Dá:
1. Score de compatibilidade (0-100%)
2. Palavras-chave da vaga que faltam no CV (máx. 8)
3. 3 sugestões concretas de melhoria

Formato JSON:
{
  "score": 75,
  "keywords_em_falta": ["keyword1", ...],
  "sugestoes": ["sugestão1", "sugestão2", "sugestão3"]
}
`

  const resultado = await callAI(SYSTEM_BASE, userPrompt)
  try {
    return JSON.parse(resultado.replace(/```json|```/g, '').trim())
  } catch {
    return { score: 0, keywords_em_falta: [], sugestoes: [] }
  }
}

// ─── 5. Gerar carta de apresentação ─────────────────────────
export async function gerarCartaApresentacao(cvData, empresa, vaga) {
  const userPrompt = `
Escreve uma carta de apresentação profissional em português para:
- Candidato: ${cvData.nome}, ${cvData.cargo}
- Empresa: ${empresa}
- Vaga: ${vaga}
- Experiência: ${cvData.anos_experiencia} anos em ${cvData.sector}

A carta deve ter 3 parágrafos: abertura impactante, valor que traz, call-to-action.
Tom: profissional mas caloroso. Máximo 250 palavras.
`

  return await callAI(SYSTEM_BASE, userPrompt)
}

// ─── 6. Traduzir secção do CV ───────────────────────────────
export async function traduzirSeccao(texto, idiomaDestino) {
  const userPrompt = `
Traduz este texto de CV para ${idiomaDestino}, mantendo o tom profissional e formatação:

${texto}

Responde APENAS com a tradução.
`

  const systemTradução = `És um tradutor especializado em documentos profissionais e CVs. Mantens sempre o tom formal e a terminologia de RH correcta.`
  return await callAI(systemTradução, userPrompt)
}

export default { callAI, gerarResumoProfissional, melhorarExperiencia, sugerirCompetencias, otimizarParaVaga, gerarCartaApresentacao, traduzirSeccao }
