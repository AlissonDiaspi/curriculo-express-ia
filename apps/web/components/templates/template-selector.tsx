
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  LayoutTemplate,
} from 'lucide-react'

import { TemplateCard } from '@/components/templates/template-card'
import { TemplatePreviewModal } from '@/components/templates/template-preview-modal'
import { ActionButton } from '@/components/shared/action-button'
import { EmptyState } from '@/components/shared/states'
import { staggerContainer } from '@/components/shared/animated-section'

import { useResume } from '@/providers/resume-provider'
import { TEMPLATES, getTemplateById } from '@/lib/templates'
import { ROUTES } from '@/lib/constants'
import { api } from '@/lib/api'

import type { ResumeTemplate } from '@/types/template'

export function TemplateSelector() {
  const router = useRouter()

  const {
    resumeId,
    templateId,
    setTemplateId,
  } = useResume()

  const [preview, setPreview] =
    useState<ResumeTemplate | null>(null)

  const [isSaving, setIsSaving] = useState(false)

  const selected = getTemplateById(templateId)

  const handleContinue = async () => {
    if (isSaving) return

    if (!resumeId) {
      toast.error(
        'Não encontramos seu currículo. Volte ao formulário e salve suas informações.',
      )
      return
    }

    if (!selected) {
      toast.error(
        'Selecione um modelo para continuar.',
      )
      return
    }

    setIsSaving(true)

    try {
      await api.updateResume(resumeId, {
        templateId: selected.id,
      })

      toast.success('Modelo salvo com sucesso!')

      router.push(ROUTES.review)
    } catch (error) {
      console.error(
        'Erro ao salvar modelo:',
        error,
      )

      toast.error(
        'Não foi possível salvar o modelo. Tente novamente.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-10 pb-32 md:px-6 md:pt-14">
      <header className="flex max-w-2xl flex-col gap-3">
        <span className="font-mono text-xs font-medium tracking-wide text-primary uppercase">
          Etapa 2 de 4
        </span>

        <h1 className="font-display text-3xl font-semibold tracking-tight text-balance text-foreground md:text-4xl">
          Escolha a apresentação ideal para seu currículo
        </h1>

        <p className="leading-relaxed text-pretty text-muted-foreground">
          Suas informações continuam as mesmas. O modelo
          define apenas a organização visual. Você pode
          trocar de modelo a qualquer momento antes de
          finalizar.
        </p>
      </header>

      {TEMPLATES.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="Nenhum modelo disponível"
          description="Os modelos profissionais serão adicionados em breve."
        />
      ) : (
        <motion.div
          role="radiogroup"
          aria-label="Modelos de currículo"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={template.id === templateId}
              onSelect={() => {
                if (!isSaving) {
                  setTemplateId(template.id)
                }
              }}
              onPreview={() => setPreview(template)}
            />
          ))}
        </motion.div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <ActionButton
            variant="ghost"
            href={ROUTES.editor}
          >
            <ArrowLeft aria-hidden="true" />

            <span className="hidden sm:inline">
              Voltar às informações
            </span>

            <span className="sm:hidden">
              Voltar
            </span>
          </ActionButton>

          <p
            className="hidden min-w-0 truncate text-sm text-muted-foreground md:block"
            aria-live="polite"
          >
            {selected ? (
              <>
                Selecionado:{' '}
                <span className="font-medium text-foreground">
                  {selected.name}
                </span>
              </>
            ) : (
              'Selecione um modelo para continuar'
            )}
          </p>

          <ActionButton
            disabled={!selected || isSaving || !resumeId}
            onClick={handleContinue}
          >
            {isSaving ? 'Salvando...' : 'Continuar'}

            {!isSaving && (
              <ArrowRight
                aria-hidden="true"
                className="transition-transform group-hover/action:translate-x-0.5"
              />
            )}
          </ActionButton>
        </div>
      </div>

      <TemplatePreviewModal
        template={preview}
        onOpenChange={(open) => {
          if (!open) setPreview(null)
        }}
        selected={preview?.id === templateId}
        onSelect={(id) => {
          if (!isSaving) {
            setTemplateId(id)
            setPreview(null)
          }
        }}
      />
    </div>
  )
}
