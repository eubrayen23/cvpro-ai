import { useState, useEffect } from 'react'
import { supabase } from './services/supabase'
import { Landing } from './pages/Landing'
import { Login } from './components/auth/Login'
import { Register } from './components/auth/Register'
import { Dashboard } from './pages/Dashboard'
import { Editor } from './pages/Editor'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editorCVId, setEditorCVId] = useState(null)

  useEffect(() => {
    verificarUtilizador()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setCurrentPage('landing')
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        setCurrentPage('dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const verificarUtilizador = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setCurrentPage('dashboard')
      } else {
        setCurrentPage('landing')
      }
    } catch (err) {
      console.error('Erro ao verificar utilizador:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNavigateTo = (page) => {
    setCurrentPage(page)
  }

  const handleLoginSuccess = (usuario) => {
    setUser(usuario)
    setCurrentPage('dashboard')
  }

  const handleAbrirEditor = (cvId) => {
    setEditorCVId(cvId)
    setCurrentPage('editor')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">A carregar...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'landing' && (
        <Landing onNavigateTo={handleNavigateTo} />
      )}
      {currentPage === 'login' && (
        <Login onSuccess={handleLoginSuccess} onNavigateTo={handleNavigateTo} />
      )}
      {currentPage === 'register' && (
        <Register onSuccess={handleLoginSuccess} onNavigateTo={handleNavigateTo} />
      )}
      {currentPage === 'dashboard' && user && (
        <Dashboard onNavigateTo={handleNavigateTo} onAbrirEditor={handleAbrirEditor} />
      )}
      {currentPage === 'editor' && user && editorCVId && (
        <Editor cvId={editorCVId} onBack={() => setCurrentPage('dashboard')} />
      )}
    </div>
  )
}

export default App
