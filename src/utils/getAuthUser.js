import { supabase } from '../services/supabase'

export async function getAuthUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utilizador não autenticado')
  return user
}
