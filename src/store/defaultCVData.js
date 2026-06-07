export const DEFAULT_PESSOAL = {
  nome: '',
  email: '',
  telefone: '',
  localizacao: '',
  bi_numero: '',
  nif: '',
  provincia: '',
  municipio: '',
  nacionalidade: 'Angolana',
  data_nascimento: '',
  estado_civil: '',
  linguas_nacionais: []
}

export const DEFAULT_CV = {
  id: null,
  titulo: 'Meu CV',
  template: 'classico',
  dadosCV: {
    pessoal: { ...DEFAULT_PESSOAL },
    resumo: '',
    experiencia: [],
    educacao: [],
    competencias: { hard_skills: [], soft_skills: [] },
    idiomas: [],
    certificacoes: []
  }
}

export function createDefaultCV() {
  return JSON.parse(JSON.stringify(DEFAULT_CV))
}
