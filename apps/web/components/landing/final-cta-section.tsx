
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { AnimatedSection } from '@/components/shared/animated-section'
import { ROUTES } from '@/lib/constants'

export function FinalCtaSection() {
  return (
    <section
      className="px-4 pb-20 md:px-6 md:pb-28"
      aria-labelledby="cta-final-title"
    >
      <AnimatedSection className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-brand-gradient px-6 py-16 text-center md:px-12 md:py-24">
        <div
          className="pointer-events-none absolute inset-0 bg-grid opacity-15 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
          <h2
            id="cta-final-title"
            className="text-3xl font-semibold tracking-tight text-balance text-primary-foreground md:text-5xl"
          >
            Seu currículo merece uma apresentação profissional.
          </h2>

          <p className="text-base leading-relaxed text-pretty text-primary-foreground/80 md:text-lg">
            Organize suas informações, receba sugestões
            de melhoria com IA e escolha um modelo profissional.
            Baixe seu currículo em PDF ou Word, gratuitamente.
          </p>

          <Link
            href={ROUTES.editor}
            className="group mt-2 inline-flex h-14 items-center gap-2 rounded-full bg-card px-8 text-base font-semibold text-foreground shadow-[0_16px_40px_-12px_oklch(0.15_0.08_268/0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-12px_oklch(0.15_0.08_268/0.6)] focus-visible:ring-4 focus-visible:ring-primary-foreground/40 focus-visible:outline-none"
          >
            Criar meu currículo grátis

            <ArrowRight
              className="size-5 text-primary transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>

          <p className="text-sm text-primary-foreground/75">
            Sem cadastro obrigatório. Sem pagamento.
          </p>
        </div>
      </AnimatedSection>
    </section>
  )
}
