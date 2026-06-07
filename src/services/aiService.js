// ============================================================
// aiService.js — Serviço central de IA com fallback automático
// Calls go through the Netlify serverless proxy (/api/ai-proxy)
// so API keys are NEVER exposed in the client bundle.
// ============================================================

const AI_PROXY_ENDPOINT = '/.netlify/functions/ai-proxy'

const MAX_INPUT_LENGTH = 3000

function sanitize(text) {
  if (typeof text !== 'string') return ''
  return text.slice(0, MAX_INPUT_LENGTH).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
}

// ─── Chamada ao proxy ────────────────────────────────────────
async function callAI(systemPrompt, userPrompt) {
  const response = await fetch(AI_PROXY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt: sanitize(systemPrompt),
      userPrompt: sanitize(userPrompt)
    })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error || 'Serviço de IA temporariamente indisponível. Tenta novamente.')
  }

  const data = await response.json()
  return data.result
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
- Nome: ${sanitize(nome)}
- Cargo actual/pretendido: ${sanitize(cargo)}
- Anos de experiência: ${sanitize(String(anos_experiencia))}
- Sector: ${sanitize(sector)}
- Principais competências: ${sanitize(competencias)}
- Objectivo profissional: ${sanitize(objetivo || 'progressão de carreira')}

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
- Cargo: ${sanitize(cargo)}
- Empresa: ${sanitize(empresa)}
- Sector: ${sanitize(sector)}
- Descrição actual (bruta): ${sanitize(descricao_raw)}

Reescreve em 3-5 bullet points com verbos de acção fortes (Liderou, Implementou, Reduziu, Aumentou, etc.).
Adiciona percentagens ou métricas onde fizer sentido contextualmente.
Formato: cada bullet começa com "• ".
`

  return await callAI(SYSTEM_BASE, userPrompt)
}

// ─── 3. Sugerir competências por sector ─────────────────────
export async function sugerirCompetencias(cargo, sector) {
  const userPrompt = `
Para um profissional com o cargo "${sanitize(cargo)}" no sector "${sanitize(sector)}" em Angola/África,
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
${sanitize(JSON.stringify(cvData, null, 2))}

Oferta de emprego:
${sanitize(descricaoVaga)}

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
- Candidato: ${sanitize(cvData.nome)}, ${sanitize(cvData.cargo)}
- Empresa: ${sanitize(empresa)}
- Vaga: ${sanitize(vaga)}
- Experiência: ${sanitize(String(cvData.anos_experiencia))} anos em ${sanitize(cvData.sector)}

A carta deve ter 3 parágrafos: abertura impactante, valor que traz, call-to-action.
Tom: profissional mas caloroso. Máximo 250 palavras.
`

  return await callAI(SYSTEM_BASE, userPrompt)
}

// ─── 6. Traduzir secção do CV ───────────────────────────────
export async function traduzirSeccao(texto, idiomaDestino) {
  const userPrompt = `
Traduz este texto de CV para ${sanitize(idiomaDestino)}, mantendo o tom profissional e formatação:

${sanitize(texto)}

Responde APENAS com a tradução.
`

  const systemTradução = `És um tradutor especializado em documentos profissionais e CVs. Mantens sempre o tom formal e a terminologia de RH correcta.`
  return await callAI(systemTradução, userPrompt)
}

export default { callAI, gerarResumoProfissional, melhorarExperiencia, sugerirCompetencias, otimizarParaVaga, gerarCartaApresentacao, traduzirSeccao }
