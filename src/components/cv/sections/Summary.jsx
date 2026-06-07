import { useState, useEffect } from 'react'
import { AIAssistant } from '../../ai/AIAssistant'
import { Button } from '../../ui/Button'
import useCVStore from '../../../store/cvStore'

export function Summary() {
  const { cvAtual, atualizarResumo } = useCVStore()
  const [resumoTemporario, setResumoTemporario] = useState(cvAtual.dadosCV.resumo)
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    setResumoTemporario(cvAtual.dadosCV.resumo)
  }, [cvAtual.dadosCV.resumo])

  const handleAceitarSugestao = (sugestao) => {
    atualizarResumo(sugestao)
    setResumoTemporario(sugestao)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Resumo Profissional</h2>
      
      {editando ? (
        <textarea
          value={resumoTemporario}
          onChange={(e) => setResumoTemporario(e.target.value)}
          placeholder="Escreve um resumo profissional impactante..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <p className="text-gray-700 mb-4">{resumoTemporario || 'Sem resumo definido ainda...'}</p>
      )}

      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => {
            if (editando) atualizarResumo(resumoTemporario)
            setEditando(!editando)
          }}
          variant="primary"
        >
          {editando ? 'Guardar' : 'Editar'}
        </Button>
      </div>

      <AIAssistant
        secção="resumo"
        dados={cvAtual.dadosCV.pessoal}
        onResultado={handleAceitarSugestao}
      />
    </div>
  )
}
