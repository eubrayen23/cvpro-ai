import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the supabase module
const mockSupabase = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn()
}

vi.mock('./supabase', () => ({
  supabase: mockSupabase
}))

const { criarCV, obterCVsUtilizador, obterCV, atualizarCV, eliminarCV, registarUsoIA } = await import('./cvService')

// Helper to build fluent query mock chains
function mockQuery(finalResult) {
  const chain = {}
  const methods = ['from', 'insert', 'select', 'eq', 'order', 'update', 'delete', 'single']
  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })
  // The last method in a chain returns the result
  chain.select.mockResolvedValue(finalResult)
  chain.single.mockResolvedValue(finalResult)
  chain.order.mockResolvedValue(finalResult)
  chain.delete.mockReturnValue(chain)
  chain.eq.mockReturnValue(chain)
  // For delete chain ending with eq
  chain.eq.mockImplementation(() => {
    // Return a thenable that resolves to finalResult so await works
    const result = { ...chain }
    result.then = (resolve) => resolve(finalResult)
    return result
  })
  mockSupabase.from.mockReturnValue(chain)
  return chain
}

describe('cvService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('criarCV', () => {
    it('should create a CV for the authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

      const chain = {}
      const methods = ['insert', 'select']
      methods.forEach((m) => { chain[m] = vi.fn().mockReturnValue(chain) })
      chain.select.mockResolvedValue({
        data: [{ id: 'cv-1', titulo: 'Meu CV', template: 'classico' }],
        error: null
      })
      mockSupabase.from.mockReturnValue(chain)

      const result = await criarCV('Meu CV', 'classico')

      expect(result).toEqual({ id: 'cv-1', titulo: 'Meu CV', template: 'classico' })
      expect(mockSupabase.from).toHaveBeenCalledWith('cvs')
    })

    it('should throw when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      await expect(criarCV('Test')).rejects.toThrow('Utilizador não autenticado')
    })

    it('should throw on supabase error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

      const chain = {}
      chain.insert = vi.fn().mockReturnValue(chain)
      chain.select = vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') })
      mockSupabase.from.mockReturnValue(chain)

      await expect(criarCV('Test')).rejects.toThrow('DB error')
    })
  })

  describe('obterCVsUtilizador', () => {
    it('should return all CVs for the current user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

      const cvs = [{ id: '1', titulo: 'CV 1' }, { id: '2', titulo: 'CV 2' }]
      const chain = {}
      chain.select = vi.fn().mockReturnValue(chain)
      chain.eq = vi.fn().mockReturnValue(chain)
      chain.order = vi.fn().mockResolvedValue({ data: cvs, error: null })
      mockSupabase.from.mockReturnValue(chain)

      const result = await obterCVsUtilizador()
      expect(result).toEqual(cvs)
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1')
    })

    it('should throw when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      await expect(obterCVsUtilizador()).rejects.toThrow('Utilizador não autenticado')
    })
  })

  describe('obterCV', () => {
    it('should return a single CV by id', async () => {
      const cv = { id: 'cv-1', titulo: 'My CV' }
      const chain = {}
      chain.select = vi.fn().mockReturnValue(chain)
      chain.eq = vi.fn().mockReturnValue(chain)
      chain.single = vi.fn().mockResolvedValue({ data: cv, error: null })
      mockSupabase.from.mockReturnValue(chain)

      const result = await obterCV('cv-1')
      expect(result).toEqual(cv)
    })

    it('should throw on error', async () => {
      const chain = {}
      chain.select = vi.fn().mockReturnValue(chain)
      chain.eq = vi.fn().mockReturnValue(chain)
      chain.single = vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') })
      mockSupabase.from.mockReturnValue(chain)

      await expect(obterCV('bad-id')).rejects.toThrow('Not found')
    })
  })

  describe('atualizarCV', () => {
    it('should update CV data and return the updated record', async () => {
      const updated = { id: 'cv-1', data: { resumo: 'updated' } }
      const chain = {}
      chain.update = vi.fn().mockReturnValue(chain)
      chain.eq = vi.fn().mockReturnValue(chain)
      chain.select = vi.fn().mockResolvedValue({ data: [updated], error: null })
      mockSupabase.from.mockReturnValue(chain)

      const result = await atualizarCV('cv-1', { resumo: 'updated' })
      expect(result).toEqual(updated)
    })
  })

  describe('eliminarCV', () => {
    it('should delete a CV by id without error', async () => {
      const chain = {}
      chain.delete = vi.fn().mockReturnValue(chain)
      chain.eq = vi.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue(chain)

      await expect(eliminarCV('cv-1')).resolves.toBeUndefined()
      expect(mockSupabase.from).toHaveBeenCalledWith('cvs')
    })

    it('should throw on delete error', async () => {
      const chain = {}
      chain.delete = vi.fn().mockReturnValue(chain)
      chain.eq = vi.fn().mockResolvedValue({ error: new Error('Delete failed') })
      mockSupabase.from.mockReturnValue(chain)

      await expect(eliminarCV('cv-1')).rejects.toThrow('Delete failed')
    })
  })

  describe('registarUsoIA', () => {
    it('should insert an AI usage record', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

      const chain = {}
      chain.insert = vi.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue(chain)

      await registarUsoIA('resumo', 100, 'gemini')

      expect(mockSupabase.from).toHaveBeenCalledWith('ai_usage')
      expect(chain.insert).toHaveBeenCalledWith([{
        user_id: 'user-1',
        tipo: 'resumo',
        tokens_usados: 100,
        provider: 'gemini'
      }])
    })

    it('should silently return when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      // Should not throw
      await expect(registarUsoIA('test', 0)).resolves.toBeUndefined()
    })

    it('should log error but not throw on insert failure', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

      const chain = {}
      chain.insert = vi.fn().mockResolvedValue({ error: new Error('Insert failed') })
      mockSupabase.from.mockReturnValue(chain)

      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      await registarUsoIA('test', 0)
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })
  })
})
