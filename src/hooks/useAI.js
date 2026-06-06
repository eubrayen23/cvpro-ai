import { useState } from 'react'
import { gerarResumoProfissional, melhorarExperiencia, sugerirCompetencias, otimizarParaVaga, gerarCartaApresentacao, traduzirSeccao } from '../services/aiService'
import { registarUsoIA } from '../services/cvService'

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const executarIA = async (funcaoIA, tipo, ...args) => {
    setLoading(true)
    setError(null)
    try {
      const resultado = await funcaoIA(...args)
      await registarUsoIA(tipo, 0) // tokens estimados como 0 por enquanto
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
