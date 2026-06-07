import { supabase } from './supabase'

// Criar novo CV
export async function criarCV(titulo, template = 'classico') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utilizador não autenticado')

  const { data, error } = await supabase
    .from('cvs')
    .insert([
      {
        user_id: user.id,
        titulo,
        template,
        data: {},
        slug: `${titulo.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      }
    ])
    .select()

  if (error) throw error
  return data[0]
}

// Obter todos os CVs do utilizador
export async function obterCVsUtilizador() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utilizador não autenticado')

  const { data, error } = await supabase
    .from('cvs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Obter um CV específico (filtered by user_id for defense-in-depth)
export async function obterCV(cvId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utilizador não autenticado')

  const { data, error } = await supabase
    .from('cvs')
    .select('*')
    .eq('id', cvId)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

// Atualizar CV (filtered by user_id for defense-in-depth)
export async function atualizarCV(cvId, dadosCV) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utilizador não autenticado')

  const { data, error } = await supabase
    .from('cvs')
    .update({ data: dadosCV, updated_at: new Date() })
    .eq('id', cvId)
    .eq('user_id', user.id)
    .select()

  if (error) throw error
  return data[0]
}

// Eliminar CV (filtered by user_id for defense-in-depth)
export async function eliminarCV(cvId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utilizador não autenticado')

  const { error } = await supabase
    .from('cvs')
    .delete()
    .eq('id', cvId)
    .eq('user_id', user.id)

  if (error) throw error
}

// Registar uso de IA (para rate limiting)
export async function registarUsoIA(tipo, tokensUsados, provider = 'gemini') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('ai_usage')
    .insert([{
      user_id: user.id,
      tipo,
      tokens_usados: tokensUsados,
      provider
    }])

  if (error) console.error('Erro ao registar uso de IA:', error)
}

export default { criarCV, obterCVsUtilizador, obterCV, atualizarCV, eliminarCV, registarUsoIA }
