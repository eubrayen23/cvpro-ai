import { useEffect } from 'react'
import { obterCV, atualizarCV } from '../services/cvService'
import { useAsyncAction } from '../hooks/useAsyncAction'
import useCVStore from '../store/cvStore'
import { PersonalInfo } from '../components/cv/sections/PersonalInfo'
import { Summary } from '../components/cv/sections/Summary'
import { Experience } from '../components/cv/sections/Experience'
import { Button } from '../components/ui/Button'
import { PageLayout } from '../components/layout/PageLayout'

export function Editor({ cvId, onBack }) {
  const { cvAtual, carregarCV } = useCVStore()
  const { loading, execute } = useAsyncAction()
  const { loading: saving, execute: executeSave } = useAsyncAction()

  useEffect(() => {
    execute(async () => {
      const cv = await obterCV(cvId)
      carregarCV({
        id: cv.id,
        titulo: cv.titulo,
        template: cv.template,
        dadosCV: cv.data
      })
    })
  }, [cvId, execute, carregarCV])

  const handleGuardar = () => {
    executeSave(async () => {
      await atualizarCV(cvAtual.id, cvAtual.dadosCV)
      alert('CV guardado com sucesso!')
    })
  }

  if (loading) return <div className="text-center py-10">A carregar...</div>

  return (
    <PageLayout
      title="CVPro AI — Editor"
      actions={
        <>
          <Button onClick={handleGuardar} disabled={saving}>
            {saving ? '⏳ A guardar...' : '💾 Guardar'}
          </Button>
          <Button onClick={onBack} variant="secondary">← Voltar</Button>
        </>
      }
    >
      <h2 className="text-3xl font-bold mb-6">{cvAtual.titulo}</h2>
      <PersonalInfo />
      <Summary />
      <Experience />
    </PageLayout>
  )
}
