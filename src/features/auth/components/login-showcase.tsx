import { ArrowUpRight, BriefcaseBusiness, Compass } from 'lucide-react'

import loginHero from '../../../assets/login-hero.png'
import { Brand } from './brand'

export function LoginShowcase() {
  return (
    <aside
      className="relative hidden min-h-0 flex-col overflow-hidden bg-[#0b1d35] bg-cover bg-center p-10 text-white lg:flex xl:p-14"
      style={{ backgroundImage: `linear-gradient(90deg, rgba(5, 20, 40, .88) 0%, rgba(5, 20, 40, .48) 72%), url(${loginHero})` }}
    >
      <Brand />

      <div className="relative z-10 my-auto max-w-[490px] py-14">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[.14em] uppercase backdrop-blur-sm">
          <Compass className="size-4 text-[#8dc2ff]" aria-hidden="true" />
          Sua próxima oportunidade
        </span>
        <h2 className="text-[clamp(42px,4.2vw,68px)] leading-[1.04] font-bold tracking-[-.055em]">
          Um novo caminho começa aqui.
        </h2>
        <p className="mt-6 max-w-[430px] text-[17px] leading-relaxed text-[#e2eaf5]">
          Encontre vagas que combinam com você e acompanhe cada passo da sua jornada profissional.
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap gap-3 text-sm font-medium text-white/90">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
          <BriefcaseBusiness className="size-4 text-[#8dc2ff]" aria-hidden="true" />
          Explore vagas
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
          <ArrowUpRight className="size-4 text-[#8dc2ff]" aria-hidden="true" />
          Acompanhe candidaturas
        </span>
      </div>
    </aside>
  )
}
