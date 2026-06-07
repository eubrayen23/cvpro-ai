import { Button } from '../components/ui/Button'
import { PageLayout } from '../components/layout/PageLayout'

export function Landing({ onNavigateTo }) {
  return (
    <PageLayout
      actions={
        <>
          <Button variant="outline" onClick={() => onNavigateTo('login')}>Entrar</Button>
          <Button onClick={() => onNavigateTo('register')}>Registar-se</Button>
        </>
      }
    >
      <div className="py-10">
        <h2 className="text-5xl font-bold text-center mb-6">Cria o teu CV Profissional com IA</h2>
        <p className="text-xl text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Gera currículos impactantes otimizados para sistemas ATS. Sugestões inteligentes com Gemini & Groq.
          Completamente gratuito.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-4xl mb-4">✨</p>
            <h3 className="font-bold mb-2">IA Inteligente</h3>
            <p className="text-gray-600">Gemini & Groq geram conteúdo profissional em português</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-4xl mb-4">🎨</p>
            <h3 className="font-bold mb-2">Templates Modernos</h3>
            <p className="text-gray-600">Clássico, Moderno e Angolano com campos específicos</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-4xl mb-4">📊</p>
            <h3 className="font-bold mb-2">Otimizado ATS</h3>
            <p className="text-gray-600">Compatível com sistemas de rastreamento de candidatos</p>
          </div>
        </div>

        <div className="text-center">
          <Button onClick={() => onNavigateTo('register')} className="px-8 py-3 text-lg">
            Começar Agora — Grátis
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
