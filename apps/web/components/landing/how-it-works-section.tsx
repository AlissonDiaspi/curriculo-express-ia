
'use client'

import { motion } from 'motion/react'

import {
  Download,
  LayoutTemplate,
  Sparkles,
  UserRound,
} from 'lucide-react'

import {
  SectionHeading,
} from '@/components/shared/section-heading'

import {
  staggerContainer,
  staggerItem,
} from '@/components/shared/animated-section'

const STEPS = [
  {
    icon: UserRound,
    title: 'Conte sobre você',
    description:
      'Preencha suas informações pessoais, experiências, formação e habilidades.',
  },
  {
    icon: Sparkles,
    title: 'Melhore seus textos com IA',
    description:
      'Receba sugestões para melhorar a redação, sem inventar informações.',
  },
  {
    icon: LayoutTemplate,
    title: 'Escolha seu modelo',
    description:
      'Selecione um dos três modelos profissionais disponíveis.',
  },
  {
    icon: Download,
    title: 'Revise e baixe gratuitamente',
    description:
      'Confira a prévia e baixe seu currículo em PDF ou Word, sem pagamento.',
  },
]

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="scroll-mt-20 border-y border-border bg-card py-20 md:py-28"
      aria-labelledby="como-funciona-title"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 md:px-6">
        <SectionHeading
          id="como-funciona-title"
          eyebrow="Como funciona"
          title="Do preenchimento ao currículo profissional, sem complicação."
          description="Quatro passos simples para criar, personalizar e baixar seu currículo gratuitamente. Você pode revisar suas informações antes de finalizar."
        />

        <motion.ol
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{
            once: true,
            margin: '-80px',
          }}
          className="relative grid gap-8 md:grid-cols-4 md:gap-6"
        >
          {/* Linha que conecta as etapas */}
          <div
            className="absolute top-7 bottom-7 left-7 w-px bg-border md:top-7 md:right-[12.5%] md:bottom-auto md:left-[12.5%] md:h-px md:w-auto"
            aria-hidden="true"
          >
            <motion.div
              className="h-full w-full origin-top bg-brand-gradient md:origin-left"
              initial={{
                scaleY: 0,
                scaleX: 0,
              }}
              whileInView={{
                scaleY: 1,
                scaleX: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 1.4,
                delay: 0.3,
                ease: EASE,
              }}
            />
          </div>

          {STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              variants={staggerItem}
              className="relative flex gap-5 md:flex-col md:items-center md:text-center"
            >
              {/* Ícone */}
              <div className="group relative z-10 flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                <step.icon
                  className="size-6 text-primary transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                />

                {/* Número */}
                <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-brand-gradient font-mono text-[0.65rem] font-semibold text-primary-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Texto */}
              <div className="flex flex-col gap-1.5 pt-1.5 md:pt-0">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  )
}

const EASE = [0.22, 1, 0.36, 1] as const
