import { useState } from 'react'
import { supabase } from '../../services/supabase'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function Login({ onSuccess, onNavigateTo }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
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
        <h1 className="text-2xl font-bold mb-6">Entrar no CVPro AI</h1>
        <form onSubmit={handleLogin}>
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
            placeholder="Sua senha"
            required
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <Button disabled={loading} className="w-full">
            {loading ? 'A carregar...' : 'Entrar'}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Não tens conta?{' '}
          <button onClick={() => onNavigateTo('register')} className="text-blue-600 hover:underline">
            Registar-se
          </button>
        </p>
      </div>
    </div>
  )
}
