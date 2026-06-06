import { useState } from 'react'
import { useAI } from '../../hooks/useAI'
import { Button } from '../ui/Button'

export function AIAssistant({ secção, dados, onResultado }) {
  const { loading, error, gerarResumo, melhorarExp, sugerirSkills } = useAI()
  const [resultado, setResultado] = useState('')
  const [mostrarResultado, setMostrarResultado] = useState(false)

  const acçõesPorSeccao = {
    resumo: {
      label: '✨ Gerar Resumo com IA',
      acao: async () => {
        const texto = await gerarResumo(dados)
        if (texto) {
          setResultado(texto)
          setMostrarResultado(true)
          onResultado(texto)
        }
      }
    },
    experiencia: {
      label: '🚀 Melhorar Descrição',
      acao: async () => {
        const texto = await melhorarExp(dados)
        if (texto) {
          setResultado(texto)
          setMostrarResultado(true)
          onResultado(texto)
        }
      }
    },
    competencias: {
      label: '💡 Sugerir Competências',
      acao: async () => {
        const skills = await sugerirSkills(dados.cargo, dados.sector)
        if (skills) {
          setResultado(JSON.stringify(skills, null, 2))
          setMostrarResultado(true)
          onResultado(skills)
        }
      }
    }
  }

  const acção = acçõesPorSeccao[secção]
  if (!acção) return null

  return (
    <div className="ai-assistant">
      <Button
        onClick={acção.acao}
        disabled={loading}
        variant="primary"
        className="w-full"
      >
        {loading ? '⏳ A processar...' : acção.label}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">⚠️ {error}</p>}
      {mostrarResultado && resultado && (
        <div className="resultado-ia">
          <p className="text-xs text-gray-400 mb-2">💬 Sugestão da IA:</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {typeof resultado === 'string' ? resultado : JSON.stringify(resultado, null, 2)}
          </p>
          <Button
            onClick={() => setMostrarResultado(false)}
            variant="secondary"
            className="mt-3 text-xs"
          >
            Fechar
          </Button>
        </div>
      )}
    </div>
  )
}
