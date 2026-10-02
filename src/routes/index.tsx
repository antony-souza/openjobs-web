import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '../features/auth/components/login-form'
import { LoginShowcase } from '../features/auth/components/login-showcase'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="grid min-h-dvh grid-cols-1 bg-[#f7f9fc] lg:grid-cols-[minmax(0,1fr)_minmax(500px,1fr)]">
      <LoginShowcase />
      <section className="flex min-h-dvh flex-col px-6 py-8 sm:px-10 lg:min-h-0 lg:px-12 lg:py-10 xl:px-20">
        <div className="flex flex-1 items-center justify-center py-12 lg:py-0">
          <LoginForm />
        </div>
        <footer className="text-center text-xs text-[#8493a8]">© 2026 Open Jobs. Todos os direitos reservados.</footer>
      </section>
    </div>
  )
}
