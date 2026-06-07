import { gerarResumoProfissional, melhorarExperiencia, sugerirCompetencias, otimizarParaVaga, gerarCartaApresentacao, traduzirSeccao } from '../services/aiService'
import { registarUsoIA } from '../services/cvService'
import { useAsyncAction } from './useAsyncAction'

export function useAI() {
  const { loading, error, execute } = useAsyncAction()

  const executarIA = (funcaoIA, tipo, ...args) =>
    execute(async () => {
      const resultado = await funcaoIA(...args)
      await registarUsoIA(tipo, 0)
      return resultado
    })

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
