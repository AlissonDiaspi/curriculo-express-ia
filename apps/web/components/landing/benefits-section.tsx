
'use client'

import { motion } from 'motion/react'

import {
  Clock,
  Download,
  LayoutTemplate,
  PenLine,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react'

import { FeatureCard } from '@/components/shared/feature-card'
import { SectionHeading } from '@/components/shared/section-heading'
import { staggerContainer } from '@/components/shared/animated-section'

const BENEFITS = [
  {
    icon: PenLine,
    title: 'Escreva melhor com IA',
    description:
      'Receba sugestões para organizar e melhorar a redação das suas informações profissionais.',
  },
  {
    icon: Clock,
    title: 'Economize tempo',
    description:
      'Preencha suas informações em um formulário simples, organizado por etapas.',
  },
  {
    icon: LayoutTemplate,
    title: 'Escolha seu estilo',
    description:
      'Selecione entre três modelos profissionais de currículo.',
  },
  {
    icon: ShieldCheck,
    title: 'Mantenha sua história real',
    description:
      'A IA é orientada a melhorar seus textos sem inventar experiências ou qualificações.',
    highlight: true,
  },
  {
    icon: ScanSearch,
    title: 'Visualize antes de baixar',
    description:
      'Confira a prévia do documento e ajuste suas informações ou o modelo escolhido.',
  },
  {
    icon: Download,
    title: 'Baixe gratuitamente',
    description:
      'Exporte seu currículo em PDF ou Word, sem assinatura ou pagamento.',
  },
]

export function BenefitsSection() {
  return (
    <section
      id="beneficios"
      className="scroll-mt-20 py-20 md:py-28"
      aria-labelledby="beneficios-title"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 md:px-6">
        <SectionHeading
          id="beneficios-title"
          eyebrow="Benefícios"
          title="Um currículo profissional não precisa ser complicado."
          description="Organize sua trajetória, melhore seus textos e baixe seu currículo gratuitamente."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{
            once: true,
            margin: '-80px',
          }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {BENEFITS.map((benefit) => (
            <FeatureCard
              key={benefit.title}
              {...benefit}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
