import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock dependencies
vi.mock('../services/aiService', () => ({
  gerarResumoProfissional: vi.fn(),
  melhorarExperiencia: vi.fn(),
  sugerirCompetencias: vi.fn(),
  otimizarParaVaga: vi.fn(),
  gerarCartaApresentacao: vi.fn(),
  traduzirSeccao: vi.fn()
}))

vi.mock('../services/cvService', () => ({
  registarUsoIA: vi.fn().mockResolvedValue(undefined)
}))

const aiServiceMocks = await import('../services/aiService')
const { registarUsoIA } = await import('../services/cvService')
const { useAI } = await import('./useAI')

describe('useAI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should start with loading=false and error=null', () => {
    const { result } = renderHook(() => useAI())
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should set loading while AI function executes', async () => {
    let resolveAI
    aiServiceMocks.gerarResumoProfissional.mockImplementation(
      () => new Promise((resolve) => { resolveAI = resolve })
    )

    const { result } = renderHook(() => useAI())

    let promise
    act(() => {
      promise = result.current.gerarResumo({ nome: 'Test' })
    })

    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolveAI('Result')
      await promise
    })

    expect(result.current.loading).toBe(false)
  })

  it('should return the AI result on success', async () => {
    aiServiceMocks.gerarResumoProfissional.mockResolvedValue('Generated summary')

    const { result } = renderHook(() => useAI())

    let aiResult
    await act(async () => {
      aiResult = await result.current.gerarResumo({ nome: 'João' })
    })

    expect(aiResult).toBe('Generated summary')
    expect(result.current.error).toBeNull()
  })

  it('should register AI usage after successful call', async () => {
    aiServiceMocks.gerarResumoProfissional.mockResolvedValue('ok')

    const { result } = renderHook(() => useAI())

    await act(async () => {
      await result.current.gerarResumo({})
    })

    expect(registarUsoIA).toHaveBeenCalledWith('resumo', 0)
  })

  it('should set error on failure and return null', async () => {
    aiServiceMocks.melhorarExperiencia.mockRejectedValue(new Error('API falhou'))

    const { result } = renderHook(() => useAI())

    let aiResult
    await act(async () => {
      aiResult = await result.current.melhorarExp({ cargo: 'Dev' })
    })

    expect(aiResult).toBeNull()
    expect(result.current.error).toBe('API falhou')
    expect(result.current.loading).toBe(false)
  })

  it('should clear previous error on new call', async () => {
    aiServiceMocks.sugerirCompetencias.mockRejectedValueOnce(new Error('fail'))
    aiServiceMocks.sugerirCompetencias.mockResolvedValueOnce({ hard_skills: [], soft_skills: [] })

    const { result } = renderHook(() => useAI())

    await act(async () => {
      await result.current.sugerirSkills('Dev', 'IT')
    })
    expect(result.current.error).toBe('fail')

    await act(async () => {
      await result.current.sugerirSkills('Dev', 'IT')
    })
    expect(result.current.error).toBeNull()
  })

  it('should call otimizarParaVaga with correct args', async () => {
    aiServiceMocks.otimizarParaVaga.mockResolvedValue({ score: 80 })

    const { result } = renderHook(() => useAI())

    await act(async () => {
      await result.current.otimizarVaga({ nome: 'Test' }, 'Dev vaga')
    })

    expect(aiServiceMocks.otimizarParaVaga).toHaveBeenCalledWith({ nome: 'Test' }, 'Dev vaga')
  })

  it('should call gerarCartaApresentacao with correct args', async () => {
    aiServiceMocks.gerarCartaApresentacao.mockResolvedValue('Carta gerada')

    const { result } = renderHook(() => useAI())

    await act(async () => {
      await result.current.gerarCarta({ nome: 'Test' }, 'Google', 'Dev')
    })

    expect(aiServiceMocks.gerarCartaApresentacao).toHaveBeenCalledWith(
      { nome: 'Test' }, 'Google', 'Dev'
    )
  })

  it('should call traduzirSeccao with correct args', async () => {
    aiServiceMocks.traduzirSeccao.mockResolvedValue('Translated')

    const { result } = renderHook(() => useAI())

    await act(async () => {
      await result.current.traduzir('Texto', 'inglês')
    })

    expect(aiServiceMocks.traduzirSeccao).toHaveBeenCalledWith('Texto', 'inglês')
  })
})
