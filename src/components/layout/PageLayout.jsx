export function PageLayout({ title = 'CVPro AI', actions, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">{title}</h1>
          {actions && <div className="flex gap-4 items-center">{actions}</div>}
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-10">{children}</div>
    </div>
  )
}
