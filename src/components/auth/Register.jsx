import { useState } from 'react'
import { supabase } from '../../services/supabase'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function Register({ onSuccess, onNavigateTo }) {
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

    if (!nome.trim()) {
      setError('O nome é obrigatório')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Registar-se no CVPro AI</h1>
        <form onSubmit={handleRegister}>
          <Input
            label="Nome Completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Teu nome"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teu@email.com"
            required
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
          />
          <Input
            label="Confirmar Senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirma a senha"
            required
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <Button disabled={loading} className="w-full">
            {loading ? 'A registar...' : 'Registar'}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Já tens conta?{' '}
          <button onClick={() => onNavigateTo('login')} className="text-blue-600 hover:underline">
            Entrar
          </button>
        </p>
      </div>
    </div>
  )
}
