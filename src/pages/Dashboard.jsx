import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { obterCVsUtilizador, criarCV } from '../services/cvService'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { PageLayout } from '../components/layout/PageLayout'

export function Dashboard({ onNavigateTo, onAbrirEditor }) {
  const [cvs, setCVs] = useState([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [novoTitulo, setNovoTitulo] = useState('')
  const [user, setUser] = useState(null)
  const { loading, execute } = useAsyncAction()

  useEffect(() => {
    execute(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const cvsList = await obterCVsUtilizador()
      setCVs(cvsList)
    })
  }, [execute])

  const handleNovoCV = async () => {
    if (!novoTitulo.trim()) return
    try {
      const novoCV = await criarCV(novoTitulo, 'classico')
      setCVs([...cvs, novoCV])
      setMostrarModal(false)
      setNovoTitulo('')
      onAbrirEditor(novoCV.id)
    } catch (err) {
      console.error('Erro ao criar CV:', err)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onNavigateTo('landing')
  }

  return (
    <PageLayout
      actions={
        <>
          <p className="text-gray-600">Olá, {user?.email}</p>
          <Button variant="secondary" onClick={handleLogout}>Sair</Button>
        </>
      }
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Os Meus CVs</h2>
        <Button onClick={() => setMostrarModal(true)}>+ Novo CV</Button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">A carregar...</p>
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

      <Modal isOpen={mostrarModal} onClose={() => setMostrarModal(false)} title="Novo CV">
        <input
          type="text"
          placeholder="Nome do CV (ex: CV - Desenvolvedor)"
          value={novoTitulo}
          onChange={(e) => setNovoTitulo(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-4">
          <Button onClick={handleNovoCV} className="flex-1">Criar</Button>
          <Button onClick={() => setMostrarModal(false)} variant="secondary" className="flex-1">
            Cancelar
          </Button>
        </div>
      </Modal>
    </PageLayout>
  )
}
