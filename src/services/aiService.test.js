import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock import.meta.env before importing the module
vi.stubEnv('VITE_GEMINI_API_KEY', 'test-gemini-key')
vi.stubEnv('VITE_GROQ_API_KEY', 'test-groq-key')

const { default: aiService, gerarResumoProfissional, melhorarExperiencia, sugerirCompetencias, otimizarParaVaga, gerarCartaApresentacao, traduzirSeccao } = await import('./aiService')

describe('aiService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('callAI (fallback logic)', () => {
    it('should return Gemini result when Gemini succeeds', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Gemini response' }] } }]
        })
      })

      const result = await aiService.callAI('system', 'user prompt')
      expect(result).toBe('Gemini response')
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('should fallback to Groq when Gemini fails', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: { message: 'Rate limit' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'Groq response' } }]
          })
        })

      const result = await aiService.callAI('system', 'user prompt')
      expect(result).toBe('Groq response')
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should throw when both APIs fail', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: { message: 'Gemini down' } })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: { message: 'Groq down' } })
        })

      await expect(aiService.callAI('system', 'prompt'))
        .rejects.toThrow('Serviço de IA temporariamente indisponível')
    })
  })

  describe('gerarResumoProfissional', () => {
    it('should call AI with user data and return the result', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Resumo profissional gerado' }] } }]
        })
      })

      const result = await gerarResumoProfissional({
        nome: 'Ana',
        cargo: 'Engenheira',
        anos_experiencia: 5,
        sector: 'Tecnologia',
        competencias: 'React, Node',
        objetivo: 'Liderança'
      })

      expect(result).toBe('Resumo profissional gerado')
      const body = JSON.parse(fetch.mock.calls[0][1].body)
      expect(body.contents[0].parts[0].text).toContain('Ana')
      expect(body.contents[0].parts[0].text).toContain('Engenheira')
    })

    it('should use default objective when none provided', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'result' }] } }]
        })
      })

      await gerarResumoProfissional({
        nome: 'Test',
        cargo: 'Dev',
        anos_experiencia: 1,
        sector: 'IT',
        competencias: 'JS'
      })

      const body = JSON.parse(fetch.mock.calls[0][1].body)
      expect(body.contents[0].parts[0].text).toContain('progressão de carreira')
    })
  })

  describe('melhorarExperiencia', () => {
    it('should send experience details and return improved text', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: '• Liderou equipa de 5 pessoas' }] } }]
        })
      })

      const result = await melhorarExperiencia({
        cargo: 'Gestor',
        empresa: 'Acme',
        descricao_raw: 'Geri equipa',
        sector: 'Finanças'
      })

      expect(result).toBe('• Liderou equipa de 5 pessoas')
    })
  })

  describe('sugerirCompetencias', () => {
    it('should parse valid JSON response', async () => {
      const skills = { hard_skills: ['Python', 'SQL'], soft_skills: ['Liderança'] }
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify(skills) }] } }]
        })
      })

      const result = await sugerirCompetencias('Analista', 'Dados')
      expect(result).toEqual(skills)
    })

    it('should return empty arrays when JSON parse fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'not json' }] } }]
        })
      })

      const result = await sugerirCompetencias('Analista', 'Dados')
      expect(result).toEqual({ hard_skills: [], soft_skills: [] })
    })

    it('should strip markdown code fences from JSON response', async () => {
      const skills = { hard_skills: ['React'], soft_skills: ['Comunicação'] }
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: '```json\n' + JSON.stringify(skills) + '\n```' }] } }]
        })
      })

      const result = await sugerirCompetencias('Dev', 'Tech')
      expect(result).toEqual(skills)
    })
  })

  describe('otimizarParaVaga', () => {
    it('should parse valid optimization result', async () => {
      const optimization = { score: 85, keywords_em_falta: ['AWS'], sugestoes: ['Add cloud'] }
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify(optimization) }] } }]
        })
      })

      const result = await otimizarParaVaga({ nome: 'Test' }, 'Vaga de Dev')
      expect(result).toEqual(optimization)
    })

    it('should return fallback when JSON parse fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'invalid json' }] } }]
        })
      })

      const result = await otimizarParaVaga({}, 'Vaga')
      expect(result).toEqual({ score: 0, keywords_em_falta: [], sugestoes: [] })
    })
  })

  describe('gerarCartaApresentacao', () => {
    it('should generate a cover letter', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Prezado(a) recrutador...' }] } }]
        })
      })

      const result = await gerarCartaApresentacao(
        { nome: 'João', cargo: 'Dev', anos_experiencia: 3, sector: 'IT' },
        'Google',
        'Frontend Dev'
      )
      expect(result).toBe('Prezado(a) recrutador...')
    })
  })

  describe('traduzirSeccao', () => {
    it('should return translated text', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Professional summary' }] } }]
        })
      })

      const result = await traduzirSeccao('Resumo profissional', 'inglês')
      expect(result).toBe('Professional summary')
    })

    it('should use translation-specific system prompt', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'translated' }] } }]
        })
      })

      await traduzirSeccao('texto', 'inglês')

      const body = JSON.parse(fetch.mock.calls[0][1].body)
      expect(body.system_instruction.parts[0].text).toContain('tradutor')
    })
  })
})
