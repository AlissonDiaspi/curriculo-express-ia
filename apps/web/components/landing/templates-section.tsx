'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/shared/section-heading'
import { staggerContainer } from '@/components/shared/animated-section'
import { SecondaryButton } from '@/components/shared/action-button'
import { TemplateCard } from '@/components/templates/template-card'
import { TemplatePreviewModal } from '@/components/templates/template-preview-modal'
import { TEMPLATES } from '@/lib/templates'
import { ROUTES } from '@/lib/constants'
import type { ResumeTemplate } from '@/types/template'

export function TemplatesSection() {
  const [preview, setPreview] = useState<ResumeTemplate | null>(null)

  return (
    <section id="modelos" className="scroll-mt-20 border-y border-border bg-card py-20 md:py-28" aria-labelledby="modelos-title">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 md:px-6">
        <SectionHeading
          id="modelos-title"
          eyebrow="Modelos"
          title="Modelos profissionais para diferentes perfis."
          description="Escolha a apresentação que combina com você. Seu conteúdo continua o mesmo — só o visual muda."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TEMPLATES.map((t) => (
            <TemplateCard key={t.id} template={t} onPreview={() => setPreview(t)} />
          ))}
        </motion.div>
        <div className="flex justify-center">
          <SecondaryButton href={ROUTES.templates}>
            Ver todos os modelos
            <ArrowRight />
          </SecondaryButton>
        </div>
      </div>
      <TemplatePreviewModal template={preview} onOpenChange={(open) => !open && setPreview(null)} />
    </section>
  )
}
