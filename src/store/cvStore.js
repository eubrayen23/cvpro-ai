import { create } from 'zustand'

const defaultDadosCV = {
  pessoal: {
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
  },
  resumo: '',
  experiencia: [],
  educacao: [],
  competencias: {
    hard_skills: [],
    soft_skills: []
  },
  idiomas: [],
  certificacoes: []
}

const useCVStore = create((set) => ({
  cvAtual: {
    id: null,
    titulo: 'Meu CV',
    template: 'classico',
    dadosCV: { ...defaultDadosCV }
  },

  atualizarPessoal: (dados) =>
    set((state) => ({
      cvAtual: {
        ...state.cvAtual,
        dadosCV: {
          ...state.cvAtual.dadosCV,
          pessoal: { ...state.cvAtual.dadosCV.pessoal, ...dados }
        }
      }
    })),

  atualizarResumo: (texto) =>
    set((state) => ({
      cvAtual: {
        ...state.cvAtual,
        dadosCV: { ...state.cvAtual.dadosCV, resumo: texto }
      }
    })),

  adicionarExperiencia: (experiencia) =>
    set((state) => ({
      cvAtual: {
        ...state.cvAtual,
        dadosCV: {
          ...state.cvAtual.dadosCV,
          experiencia: [...state.cvAtual.dadosCV.experiencia, { id: crypto.randomUUID(), ...experiencia }]
        }
      }
    })),

  atualizarExperiencia: (id, dados) =>
    set((state) => ({
      cvAtual: {
        ...state.cvAtual,
        dadosCV: {
          ...state.cvAtual.dadosCV,
          experiencia: state.cvAtual.dadosCV.experiencia.map((exp) =>
            exp.id === id ? { ...exp, ...dados } : exp
          )
        }
      }
    })),

  removerExperiencia: (id) =>
    set((state) => ({
      cvAtual: {
        ...state.cvAtual,
        dadosCV: {
          ...state.cvAtual.dadosCV,
          experiencia: state.cvAtual.dadosCV.experiencia.filter((exp) => exp.id !== id)
        }
      }
    })),

  atualizarEducacao: (educacao) =>
    set((state) => ({
      cvAtual: {
        ...state.cvAtual,
        dadosCV: {
          ...state.cvAtual.dadosCV,
          educacao
        }
      }
    })),

  atualizarCompetencias: (hard_skills, soft_skills) =>
    set((state) => ({
      cvAtual: {
        ...state.cvAtual,
        dadosCV: {
          ...state.cvAtual.dadosCV,
          competencias: { hard_skills, soft_skills }
        }
      }
    })),

  carregarCV: (cv) => {
    const mergedDados = {
      ...defaultDadosCV,
      ...cv.dadosCV,
      pessoal: { ...defaultDadosCV.pessoal, ...(cv.dadosCV?.pessoal || {}) },
      competencias: { ...defaultDadosCV.competencias, ...(cv.dadosCV?.competencias || {}) }
    }
    set({ cvAtual: { ...cv, dadosCV: mergedDados } })
  },

  limparCV: () =>
    set({
      cvAtual: {
        id: null,
        titulo: 'Meu CV',
        template: 'classico',
        dadosCV: { ...defaultDadosCV }
      }
    })
}))

export default useCVStore
