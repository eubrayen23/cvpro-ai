import { supabase } from './supabase'

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function criarCV(titulo, template = 'classico') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utilizador não autenticado')

  const defaultData = {
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
    competencias: { hard_skills: [], soft_skills: [] },
    idiomas: [],
    certificacoes: []
  }

  const { data, error } = await supabase
    .from('cvs')
    .insert([
      {
        user_id: user.id,
        titulo,
        template,
        data: defaultData,
        slug: `${slugify(titulo)}-${Date.now()}`
      }
    ])
    .select()

  if (error) throw error
  return data[0]
}

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

export async function atualizarCV(cvId, dadosCV) {
  const { data, error } = await supabase
    .from('cvs')
    .update({ data: dadosCV, updated_at: new Date().toISOString() })
    .eq('id', cvId)
    .select()

  if (error) throw error
  return data[0]
}

export async function eliminarCV(cvId) {
  const { error } = await supabase
    .from('cvs')
    .delete()
    .eq('id', cvId)

  if (error) throw error
}

export async function registarUsoIA(tipo, tokensEstimados, provider = 'gemini') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('ai_usage')
    .insert([{
      user_id: user.id,
      tipo,
      tokens_usados: tokensEstimados,
      provider
    }])

  if (error) console.error('Erro ao registar uso de IA:', error)
}

export async function verificarLimiteIA(limite = 50) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', hoje.toISOString())

  if (error) {
    console.error('Erro ao verificar limite de IA:', error)
    return true
  }

  return (count || 0) < limite
}
