import { useEffect, useState } from 'react'
import { obterCV, atualizarCV } from '../services/cvService'
import useCVStore from '../store/cvStore'
import { PersonalInfo } from '../components/cv/sections/PersonalInfo'
import { Summary } from '../components/cv/sections/Summary'
import { Experience } from '../components/cv/sections/Experience'
import { Button } from '../components/ui/Button'

export function Editor({ cvId, onBack }) {
  const { cvAtual, carregarCV } = useCVStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    carregarCVEditor()
  }, [cvId])

  const carregarCVEditor = async () => {
    try {
      const cv = await obterCV(cvId)
      carregarCV({
        id: cv.id,
        titulo: cv.titulo,
        template: cv.template,
        dadosCV: cv.data
      })
    } catch (err) {
      console.error('Erro ao carregar CV:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async () => {
    setSaving(true)
    try {
      await atualizarCV(cvAtual.id, cvAtual.dadosCV)
      alert('CV guardado com sucesso!')
    } catch (err) {
      console.error('Erro ao guardar CV:', err)
      alert('Erro ao guardar CV')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-10">A carregar...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">CVPro AI — Editor</h1>
          <div className="flex gap-4">
            <Button onClick={handleGuardar} disabled={saving}>
              {saving ? '⏳ A guardar...' : '💾 Guardar'}
            </Button>
            <Button onClick={onBack} variant="secondary">← Voltar</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-6">{cvAtual.titulo}</h2>
        <PersonalInfo />
        <Summary />
        <Experience />
      </div>
    </div>
  )
}
