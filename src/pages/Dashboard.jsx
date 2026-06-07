import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { obterCVsUtilizador, criarCV } from '../services/cvService'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'

export function Dashboard({ onNavigateTo, onAbrirEditor }) {
  const [cvs, setCVs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [novoTitulo, setNovoTitulo] = useState('')
  const [novoError, setNovoError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const cvsList = await obterCVsUtilizador()
      setCVs(cvsList)
    } catch (err) {
      console.error('Erro ao carregar CVs:', err)
      setError('Não foi possível carregar os CVs. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleNovoCV = async () => {
    if (!novoTitulo.trim()) return
    setNovoError(null)
    try {
      const novoCV = await criarCV(novoTitulo, 'classico')
      setCVs([...cvs, novoCV])
      setMostrarModal(false)
      setNovoTitulo('')
      onAbrirEditor(novoCV.id)
    } catch (err) {
      console.error('Erro ao criar CV:', err)
      setNovoError('Não foi possível criar o CV. Tenta novamente.')
    }
  }

  const handleLogout = async () => {
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      console.error('Erro ao terminar sessão:', signOutError)
    }
    onNavigateTo('landing')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">CVPro AI</h1>
          <div className="flex gap-4 items-center">
            <p className="text-gray-600">Olá, {user?.email}</p>
            <Button variant="secondary" onClick={handleLogout}>Sair</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Os Meus CVs</h2>
          <Button onClick={() => setMostrarModal(true)}>+ Novo CV</Button>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">A carregar...</p>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={carregarDados}>Tentar novamente</Button>
          </div>
        ) : cvs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">Ainda não tens nenhum CV. Cria um novo para começar!</p>
            <Button onClick={() => setMostrarModal(true)}>Criar Primeiro CV</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cvs.map((cv) => (
              <div key={cv.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="font-bold text-lg mb-2">{cv.titulo}</h3>
                <p className="text-sm text-gray-500 mb-4">Template: {cv.template}</p>
                <p className="text-xs text-gray-400 mb-4">
                  Criado: {new Date(cv.created_at).toLocaleDateString('pt-AO')}
                </p>
                <Button onClick={() => onAbrirEditor(cv.id)} className="w-full">
                  Editar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={mostrarModal} onClose={() => setMostrarModal(false)} title="Novo CV">
        <input
          type="text"
          placeholder="Nome do CV (ex: CV - Desenvolvedor)"
          value={novoTitulo}
          onChange={(e) => setNovoTitulo(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {novoError && <p className="text-red-500 text-sm mb-3">{novoError}</p>}
        <div className="flex gap-4">
          <Button onClick={handleNovoCV} className="flex-1">Criar</Button>
          <Button onClick={() => { setMostrarModal(false); setNovoError(null) }} variant="secondary" className="flex-1">
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
