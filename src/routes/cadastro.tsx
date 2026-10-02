import { createFileRoute } from '@tanstack/react-router'

import { LoginShowcase } from '../features/auth/components/login-showcase'
import { SignUpForm } from '../features/auth/components/sign-up-form'

export const Route = createFileRoute('/cadastro')({ component: SignUpPage })

function SignUpPage() {
  return (
    <div className="grid min-h-dvh grid-cols-1 bg-[#f7f9fc] lg:grid-cols-[minmax(0,1fr)_minmax(500px,1fr)]">
      <LoginShowcase />
      <section className="flex min-h-dvh flex-col px-6 py-8 sm:px-10 lg:min-h-0 lg:px-12 lg:py-10 xl:px-20">
        <div className="flex flex-1 items-center justify-center py-12 lg:py-0">
          <SignUpForm />
        </div>
        <footer className="text-center text-xs text-[#8493a8]">© 2026 Open Jobs. Todos os direitos reservados.</footer>
      </section>
    </div>
  )
}
