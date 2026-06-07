import { useState } from 'react'
import { gerarResumoProfissional, melhorarExperiencia, sugerirCompetencias, otimizarParaVaga, gerarCartaApresentacao, traduzirSeccao } from '../services/aiService'
import { registarUsoIA, verificarLimiteIA } from '../services/cvService'

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const executarIA = async (funcaoIA, tipo, ...args) => {
    setLoading(true)
    setError(null)
    try {
      const permitido = await verificarLimiteIA()
      if (!permitido) {
        throw new Error('Limite diário de IA atingido. Tenta novamente amanhã.')
      }
      const resultado = await funcaoIA(...args)
      const tokensEstimados = Math.ceil((resultado?.length || 0) / 4)
      await registarUsoIA(tipo, tokensEstimados)
      return resultado
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    gerarResumo: (dados) => executarIA(gerarResumoProfissional, 'resumo', dados),
    melhorarExp: (exp) => executarIA(melhorarExperiencia, 'experiencia', exp),
    sugerirSkills: (cargo, sector) => executarIA(sugerirCompetencias, 'competencias', cargo, sector),
    otimizarVaga: (cv, vaga) => executarIA(otimizarParaVaga, 'otimizacao', cv, vaga),
    gerarCarta: (cv, empresa, vaga) => executarIA(gerarCartaApresentacao, 'carta', cv, empresa, vaga),
    traduzir: (texto, idioma) => executarIA(traduzirSeccao, 'traducao', texto, idioma),
  }
}
