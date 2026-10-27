
'use client'

import { motion } from 'motion/react'
import {
  ArrowRight,
  Check,
  FileDown,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import {
  PrimaryButton,
  SecondaryButton,
} from '@/components/shared/action-button'

import { HeroVisual } from '@/components/landing/hero-visual'
import { ROUTES } from '@/lib/constants'

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.7,
    delay,
    ease: EASE,
  },
})

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="hero-title"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pt-12 pb-20 md:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-28">
        <div className="flex flex-col items-start gap-7">
          {/* Destaque */}
          <motion.span
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card px-3 py-1.5 text-xs font-medium text-secondary-foreground shadow-xs"
          >
            <ShieldCheck
              className="size-3.5 text-primary"
              aria-hidden="true"
            />
            Suas informações reais, apresentadas de um jeito melhor
          </motion.span>

          {/* Título */}
          <motion.h1
            id="hero-title"
            {...fadeUp(0.08)}
            className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl"
          >
            Seu próximo passo profissional começa com um{' '}
            <span className="text-gradient">
              currículo melhor.
            </span>
          </motion.h1>

          {/* Descrição */}
          <motion.p
            {...fadeUp(0.16)}
            className="max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground"
          >
            Organize suas experiências, melhore seus textos
            com ajuda da inteligência artificial e escolha
            um modelo profissional. Tudo em poucos passos,
            com download gratuito em PDF e Word.
          </motion.p>

          {/* Botões */}
          <motion.div
            {...fadeUp(0.24)}
            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
          >
            <PrimaryButton
              href={ROUTES.editor}
              size="lg"
            >
              Criar meu currículo grátis

              <ArrowRight
                className="transition-transform group-hover/action:translate-x-0.5"
                aria-hidden="true"
              />
            </PrimaryButton>

            <SecondaryButton
              href="/#como-funciona"
              size="lg"
            >
              Ver como funciona
            </SecondaryButton>
          </motion.div>

          {/* Benefícios rápidos */}
          <motion.div
            {...fadeUp(0.32)}
            className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <Check
                className="size-4 text-success"
                aria-hidden="true"
              />
              100% gratuito
            </span>

            <span className="flex items-center gap-2">
              <Sparkles
                className="size-4 text-primary"
                aria-hidden="true"
              />
              Assistência com IA
            </span>

            <span className="flex items-center gap-2">
              <FileDown
                className="size-4 text-primary"
                aria-hidden="true"
              />
              PDF e Word
            </span>
          </motion.div>
        </div>

        {/* Visual original da landing */}
        <HeroVisual />
      </div>
    </section>
  )
}
