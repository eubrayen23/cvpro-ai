import { useState } from 'react'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { AIAssistant } from '../../ai/AIAssistant'
import useCVStore from '../../../store/cvStore'

export function Experience() {
  const { cvAtual, adicionarExperiencia, atualizarExperiencia, removerExperiencia } = useCVStore()
  const [novaExp, setNovaExp] = useState({
    cargo: '',
    empresa: '',
    sector: '',
    descricao_raw: '',
    data_inicio: '',
    data_fim: ''
  })

  const handleAdicionar = () => {
    if (novaExp.cargo && novaExp.empresa) {
      adicionarExperiencia(novaExp)
      setNovaExp({
        cargo: '',
        empresa: '',
        sector: '',
        descricao_raw: '',
        data_inicio: '',
        data_fim: ''
      })
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4">💼 Experiência Profissional</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">Adicionar Experiência</h3>
        <Input
          label="Cargo"
          value={novaExp.cargo}
          onChange={(e) => setNovaExp({ ...novaExp, cargo: e.target.value })}
          placeholder="Ex: Desenvolvedor Senior"
        />
        <Input
          label="Empresa"
          value={novaExp.empresa}
          onChange={(e) => setNovaExp({ ...novaExp, empresa: e.target.value })}
          placeholder="Nome da empresa"
        />
        <Input
          label="Sector"
          value={novaExp.sector}
          onChange={(e) => setNovaExp({ ...novaExp, sector: e.target.value })}
          placeholder="Ex: Tecnologia"
        />
        <textarea
          value={novaExp.descricao_raw}
          onChange={(e) => setNovaExp({ ...novaExp, descricao_raw: e.target.value })}
          placeholder="Descreve o que fizeste..."
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            label="Data de Início"
            type="month"
            value={novaExp.data_inicio}
            onChange={(e) => setNovaExp({ ...novaExp, data_inicio: e.target.value })}
          />
          <Input
            label="Data de Fim"
            type="month"
            value={novaExp.data_fim}
            onChange={(e) => setNovaExp({ ...novaExp, data_fim: e.target.value })}
          />
        </div>
        <Button onClick={handleAdicionar} variant="primary" className="w-full">
          + Adicionar Experiência
        </Button>
      </div>

      <div className="space-y-4">
        {cvAtual.dadosCV.experiencia.map((exp) => (
          <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{exp.cargo}</h3>
                <p className="text-gray-600">{exp.empresa} • {exp.sector}</p>
                <p className="text-sm text-gray-500">{exp.data_inicio} — {exp.data_fim}</p>
              </div>
              <Button
                onClick={() => removerExperiencia(exp.id)}
                variant="danger"
                className="text-sm"
              >
                Remover
              </Button>
            </div>
            <p className="text-gray-700 mb-3">{exp.descricao_raw}</p>
            <AIAssistant
              secção="experiencia"
              dados={exp}
              onResultado={(sugestao) => atualizarExperiencia(exp.id, { descricao_raw: sugestao })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
