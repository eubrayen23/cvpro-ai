import { Input } from '../../ui/Input'
import useCVStore from '../../../store/cvStore'

export function PersonalInfo() {
  const { cvAtual, atualizarPessoal } = useCVStore()
  const { pessoal } = cvAtual.dadosCV

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4">📋 Informação Pessoal</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nome Completo"
          value={pessoal.nome}
          onChange={(e) => atualizarPessoal({ nome: e.target.value })}
          placeholder="Teu nome completo"
        />
        <Input
          label="Email"
          type="email"
          value={pessoal.email}
          onChange={(e) => atualizarPessoal({ email: e.target.value })}
          placeholder="teu@email.com"
        />
        <Input
          label="Telefone"
          value={pessoal.telefone}
          onChange={(e) => atualizarPessoal({ telefone: e.target.value })}
          placeholder="+244 9XX XXX XXX"
        />
        <Input
          label="Localização"
          value={pessoal.localizacao}
          onChange={(e) => atualizarPessoal({ localizacao: e.target.value })}
          placeholder="Luanda, Angola"
        />
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-3">🇦🇴 Dados Específicos de Angola</h3>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Bilhete de Identidade (BI)"
          value={pessoal.bi_numero}
          onChange={(e) => atualizarPessoal({ bi_numero: e.target.value })}
          placeholder="Ex: 000000000LA000"
        />
        <Input
          label="NIF (Número de Identificação Fiscal)"
          value={pessoal.nif}
          onChange={(e) => atualizarPessoal({ nif: e.target.value })}
          placeholder="Ex: 0000000000000"
        />
        <Input
          label="Província"
          value={pessoal.provincia}
          onChange={(e) => atualizarPessoal({ provincia: e.target.value })}
          placeholder="Luanda"
        />
        <Input
          label="Município"
          value={pessoal.municipio}
          onChange={(e) => atualizarPessoal({ municipio: e.target.value })}
          placeholder="Luanda"
        />
      </div>
    </div>
  )
}
