import { useState } from 'react'
import { supabase } from '../../services/supabase'
import { useAsyncAction } from '../../hooks/useAsyncAction'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function Login({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { loading, error, execute } = useAsyncAction()

  const handleLogin = (e) => {
    e.preventDefault()
    execute(async () => {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw authError
      onSuccess(data.user)
    })
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Entrar no CVPro AI</h1>
      <form onSubmit={handleLogin}>
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
          placeholder="Sua senha"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <Button disabled={loading} className="w-full">
          {loading ? 'A carregar...' : 'Entrar'}
        </Button>
      </form>
    </div>
  )
}
