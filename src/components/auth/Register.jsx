import { useState } from 'react'
import { supabase } from '../../services/supabase'
import { useAsyncAction } from '../../hooks/useAsyncAction'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function Register({ onSuccess }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { loading, error, execute } = useAsyncAction()

  const handleRegister = (e) => {
    e.preventDefault()
    execute(async () => {
      if (password !== confirmPassword) {
        throw new Error('As senhas não coincidem')
      }

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
    })
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
