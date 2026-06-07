import { create } from 'zustand'
import { createDefaultCV } from './defaultCVData'

function updateDadosCV(state, patch) {
  return {
    cvAtual: {
      ...state.cvAtual,
      dadosCV: { ...state.cvAtual.dadosCV, ...patch }
    }
  }
}

const useCVStore = create((set) => ({
  cvAtual: createDefaultCV(),

  atualizarPessoal: (dados) =>
    set((state) => updateDadosCV(state, {
      pessoal: { ...state.cvAtual.dadosCV.pessoal, ...dados }
    })),

  atualizarResumo: (texto) =>
    set((state) => updateDadosCV(state, { resumo: texto })),

  adicionarExperiencia: (experiencia) =>
    set((state) => updateDadosCV(state, {
      experiencia: [...state.cvAtual.dadosCV.experiencia, { id: Date.now(), ...experiencia }]
    })),

  atualizarExperiencia: (id, dados) =>
    set((state) => updateDadosCV(state, {
      experiencia: state.cvAtual.dadosCV.experiencia.map((exp) =>
        exp.id === id ? { ...exp, ...dados } : exp
      )
    })),

  removerExperiencia: (id) =>
    set((state) => updateDadosCV(state, {
      experiencia: state.cvAtual.dadosCV.experiencia.filter((exp) => exp.id !== id)
    })),

  atualizarEducacao: (educacao) =>
    set((state) => updateDadosCV(state, { educacao })),

  atualizarCompetencias: (hard_skills, soft_skills) =>
    set((state) => updateDadosCV(state, {
      competencias: { hard_skills, soft_skills }
    })),

  carregarCV: (cv) => set({ cvAtual: cv }),

  limparCV: () => set({ cvAtual: createDefaultCV() })
}))

export default useCVStore
