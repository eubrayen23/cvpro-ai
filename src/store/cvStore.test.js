import { describe, it, expect, beforeEach, vi } from 'vitest'
import useCVStore from './cvStore'

describe('cvStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useCVStore.getState().limparCV()
  })

  it('should have correct initial state', () => {
    const state = useCVStore.getState()
    expect(state.cvAtual.id).toBeNull()
    expect(state.cvAtual.titulo).toBe('Meu CV')
    expect(state.cvAtual.template).toBe('classico')
    expect(state.cvAtual.dadosCV.pessoal.nome).toBe('')
    expect(state.cvAtual.dadosCV.pessoal.nacionalidade).toBe('Angolana')
    expect(state.cvAtual.dadosCV.resumo).toBe('')
    expect(state.cvAtual.dadosCV.experiencia).toEqual([])
    expect(state.cvAtual.dadosCV.educacao).toEqual([])
    expect(state.cvAtual.dadosCV.competencias).toEqual({ hard_skills: [], soft_skills: [] })
    expect(state.cvAtual.dadosCV.idiomas).toEqual([])
    expect(state.cvAtual.dadosCV.certificacoes).toEqual([])
  })

  describe('atualizarPessoal', () => {
    it('should update personal data while preserving existing fields', () => {
      useCVStore.getState().atualizarPessoal({ nome: 'João Silva', email: 'joao@mail.com' })

      const { pessoal } = useCVStore.getState().cvAtual.dadosCV
      expect(pessoal.nome).toBe('João Silva')
      expect(pessoal.email).toBe('joao@mail.com')
      expect(pessoal.nacionalidade).toBe('Angolana') // preserved
    })

    it('should merge partial updates', () => {
      useCVStore.getState().atualizarPessoal({ nome: 'Maria' })
      useCVStore.getState().atualizarPessoal({ provincia: 'Luanda' })

      const { pessoal } = useCVStore.getState().cvAtual.dadosCV
      expect(pessoal.nome).toBe('Maria')
      expect(pessoal.provincia).toBe('Luanda')
    })
  })

  describe('atualizarResumo', () => {
    it('should update the resume summary text', () => {
      useCVStore.getState().atualizarResumo('Profissional com 10 anos de experiência')

      expect(useCVStore.getState().cvAtual.dadosCV.resumo).toBe(
        'Profissional com 10 anos de experiência'
      )
    })

    it('should overwrite previous summary', () => {
      useCVStore.getState().atualizarResumo('Texto antigo')
      useCVStore.getState().atualizarResumo('Texto novo')

      expect(useCVStore.getState().cvAtual.dadosCV.resumo).toBe('Texto novo')
    })
  })

  describe('experiencia CRUD', () => {
    it('should add an experience entry with auto-generated id', () => {
      useCVStore.getState().adicionarExperiencia({ cargo: 'Developer', empresa: 'TechCo' })

      const exps = useCVStore.getState().cvAtual.dadosCV.experiencia
      expect(exps).toHaveLength(1)
      expect(exps[0].cargo).toBe('Developer')
      expect(exps[0].empresa).toBe('TechCo')
      expect(exps[0].id).toEqual(expect.any(Number))
    })

    it('should add multiple experience entries', () => {
      useCVStore.getState().adicionarExperiencia({ cargo: 'Dev' })
      useCVStore.getState().adicionarExperiencia({ cargo: 'Lead' })

      expect(useCVStore.getState().cvAtual.dadosCV.experiencia).toHaveLength(2)
    })

    it('should update an existing experience by id', () => {
      useCVStore.getState().adicionarExperiencia({ cargo: 'Dev', empresa: 'A' })
      const id = useCVStore.getState().cvAtual.dadosCV.experiencia[0].id

      useCVStore.getState().atualizarExperiencia(id, { empresa: 'B' })

      const updated = useCVStore.getState().cvAtual.dadosCV.experiencia[0]
      expect(updated.cargo).toBe('Dev')
      expect(updated.empresa).toBe('B')
    })

    it('should not modify other entries when updating', () => {
      vi.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(2000)
      useCVStore.getState().adicionarExperiencia({ cargo: 'Dev' })
      useCVStore.getState().adicionarExperiencia({ cargo: 'Lead' })
      const exps = useCVStore.getState().cvAtual.dadosCV.experiencia
      const firstId = exps[0].id

      useCVStore.getState().atualizarExperiencia(firstId, { cargo: 'Senior Dev' })

      const result = useCVStore.getState().cvAtual.dadosCV.experiencia
      expect(result[0].cargo).toBe('Senior Dev')
      expect(result[1].cargo).toBe('Lead')
      vi.restoreAllMocks()
    })

    it('should remove an experience by id', () => {
      vi.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(2000)
      useCVStore.getState().adicionarExperiencia({ cargo: 'Dev' })
      useCVStore.getState().adicionarExperiencia({ cargo: 'Lead' })
      const id = useCVStore.getState().cvAtual.dadosCV.experiencia[0].id

      useCVStore.getState().removerExperiencia(id)

      const exps = useCVStore.getState().cvAtual.dadosCV.experiencia
      expect(exps).toHaveLength(1)
      expect(exps[0].cargo).toBe('Lead')
      vi.restoreAllMocks()
    })
  })

  describe('atualizarEducacao', () => {
    it('should replace education array', () => {
      const educacao = [
        { id: 1, curso: 'Engenharia', instituicao: 'UAN' },
        { id: 2, curso: 'MBA', instituicao: 'ISCAL' }
      ]
      useCVStore.getState().atualizarEducacao(educacao)

      expect(useCVStore.getState().cvAtual.dadosCV.educacao).toEqual(educacao)
    })
  })

  describe('atualizarCompetencias', () => {
    it('should set hard and soft skills', () => {
      useCVStore.getState().atualizarCompetencias(['React', 'Node.js'], ['Liderança'])

      const comp = useCVStore.getState().cvAtual.dadosCV.competencias
      expect(comp.hard_skills).toEqual(['React', 'Node.js'])
      expect(comp.soft_skills).toEqual(['Liderança'])
    })
  })

  describe('carregarCV', () => {
    it('should replace the entire CV state', () => {
      const cv = {
        id: '123',
        titulo: 'CV Loaded',
        template: 'moderno',
        dadosCV: {
          pessoal: { nome: 'Test' },
          resumo: 'Loaded summary',
          experiencia: [],
          educacao: [],
          competencias: { hard_skills: [], soft_skills: [] },
          idiomas: [],
          certificacoes: []
        }
      }
      useCVStore.getState().carregarCV(cv)

      expect(useCVStore.getState().cvAtual).toEqual(cv)
    })
  })

  describe('limparCV', () => {
    it('should reset to initial state', () => {
      useCVStore.getState().atualizarPessoal({ nome: 'Test' })
      useCVStore.getState().atualizarResumo('Something')
      useCVStore.getState().adicionarExperiencia({ cargo: 'Dev' })

      useCVStore.getState().limparCV()

      const state = useCVStore.getState()
      expect(state.cvAtual.id).toBeNull()
      expect(state.cvAtual.dadosCV.pessoal.nome).toBe('')
      expect(state.cvAtual.dadosCV.resumo).toBe('')
      expect(state.cvAtual.dadosCV.experiencia).toEqual([])
    })
  })
})
