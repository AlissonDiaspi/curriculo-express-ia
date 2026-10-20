'use client'

import { motion } from 'motion/react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '@/components/shared/action-button'
import { HeroVisual } from '@/components/landing/hero-visual'
import { ROUTES } from '@/lib/constants'

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: EASE },
})

export function HeroSection() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pt-12 pb-20 md:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-28">
        <div className="flex flex-col items-start gap-7">
          <motion.span
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card px-3 py-1.5 text-xs font-medium text-secondary-foreground shadow-xs"
          >
            <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
            Suas informações reais, apresentadas de um jeito melhor
          </motion.span>

          <motion.h1
            id="hero-title"
            {...fadeUp(0.08)}
            className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl"
          >
            Seu próximo passo profissional começa com um <span className="text-gradient">currículo melhor.</span>
          </motion.h1>

          <motion.p {...fadeUp(0.16)} className="max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
            Organize suas experiências, melhore a apresentação das suas informações com ajuda da inteligência artificial e
            crie um currículo profissional em poucos passos.
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <PrimaryButton href={ROUTES.editor} size="lg">
              Criar meu currículo agora
              <ArrowRight className="transition-transform group-hover/action:translate-x-0.5" />
            </PrimaryButton>
            <SecondaryButton href="/#como-funciona" size="lg">
              Ver como funciona
            </SecondaryButton>
          </motion.div>

          <motion.p {...fadeUp(0.32)} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex size-5 items-center justify-center rounded-full bg-success/12 text-success" aria-hidden="true">
              <svg viewBox="0 0 16 16" className="size-3">
                <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Sem complicação. Sem precisar começar do zero.
          </motion.p>
        </div>

        <HeroVisual />
      </div>
    </section>
  )
}
