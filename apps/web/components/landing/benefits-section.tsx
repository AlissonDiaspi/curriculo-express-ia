'use client'

import { motion } from 'motion/react'
import { Clock, LayoutTemplate, ListChecks, PenLine, ScanSearch, ShieldCheck } from 'lucide-react'
import { FeatureCard } from '@/components/shared/feature-card'
import { SectionHeading } from '@/components/shared/section-heading'
import { staggerContainer } from '@/components/shared/animated-section'

const BENEFITS = [
  { icon: PenLine, title: 'Escreva melhor', description: 'Organize suas informações com auxílio da inteligência artificial.' },
  { icon: Clock, title: 'Economize tempo', description: 'Preencha suas informações em um formulário simples.' },
  { icon: LayoutTemplate, title: 'Escolha seu estilo', description: 'Utilize modelos profissionais de currículo.' },
  {
    icon: ShieldCheck,
    title: 'Mantenha sua história real',
    description: 'A IA melhora a apresentação sem inventar experiências.',
    highlight: true,
  },
  { icon: ScanSearch, title: 'Revise antes de finalizar', description: 'Confira e ajuste os dados antes de gerar seu documento.' },
  { icon: ListChecks, title: 'Tudo em poucos passos', description: 'Uma experiência intuitiva do início ao fim.' },
]

export function BenefitsSection() {
  return (
    <section id="beneficios" className="scroll-mt-20 py-20 md:py-28" aria-labelledby="beneficios-title">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 md:px-6">
        <SectionHeading
          id="beneficios-title"
          eyebrow="Benefícios"
          title="Um currículo profissional não precisa ser complicado."
          description="Organize sua experiência. Valorize sua trajetória."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {BENEFITS.map((b) => (
            <FeatureCard key={b.title} {...b} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
