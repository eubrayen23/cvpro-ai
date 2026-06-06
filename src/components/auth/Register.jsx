import { useState } from 'react'
import { supabase } from '../../services/supabase'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function Register({ onSuccess }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
          },
        },
      })

      if (authError) throw authError
      onSuccess(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Registar-se no CVPro AI</h1>
      <form onSubmit={handleRegister}>
        <Input
          label="Nome Completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Teu nome"
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teu@email.com"
        />
        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Cria uma senha segura"
        />
        <Input
          label="Confirmar Senha"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirma a senha"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <Button disabled={loading} className="w-full">
          {loading ? 'A registar...' : 'Registar'}
        </Button>
      </form>
    </div>
  )
}
