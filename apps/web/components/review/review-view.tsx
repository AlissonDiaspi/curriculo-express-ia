'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, LayoutTemplate, PencilLine } from 'lucide-react'
import { ActionButton, PrimaryButton } from '@/components/shared/action-button'
import { ResumeProgress } from '@/components/resume-editor/resume-progress'
import { ResumeSummary } from '@/components/resume-editor/resume-summary'
import { TemplateThumbnail } from '@/components/templates/template-thumbnail'
import { ResumePreviewPane } from '@/components/review/resume-preview-pane'
import { useResume } from '@/providers/resume-provider'
import { getTemplateById } from '@/lib/templates'
import { ROUTES } from '@/lib/constants'

export function ReviewView() {
  const router = useRouter()
  const { resume, templateId } = useResume()
  const template = getTemplateById(templateId)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-10 pb-20 md:px-6 md:pt-14">
      <header className="flex flex-col gap-3">
        <span className="font-mono text-xs font-medium tracking-wide text-primary uppercase">Etapa 3 de 4</span>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-balance text-foreground md:text-4xl">
          Confira seu currículo antes de finalizar
        </h1>
        <p className="max-w-2xl leading-relaxed text-pretty text-muted-foreground">
          Revise as informações e o modelo escolhido. Você ainda pode ajustar qualquer detalhe.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="template-title" className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4">
            {template && (
              <div className="w-20 shrink-0 overflow-hidden rounded-lg border border-border">
                <TemplateThumbnail template={template} sizes="80px" />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 id="template-title" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Modelo selecionado
              </h2>
              <p className="truncate font-display font-semibold text-foreground">{template?.name ?? 'Nenhum'}</p>
            </div>
            <ActionButton variant="secondary" size="sm" href={ROUTES.templates}>
              <LayoutTemplate aria-hidden="true" />
              Trocar
            </ActionButton>
          </section>

          <ResumeProgress resume={resume} />

          <section aria-labelledby="info-title" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 id="info-title" className="font-display text-lg font-semibold text-foreground">
                Suas informações
              </h2>
              <ActionButton variant="ghost" size="sm" href={ROUTES.editor}>
                <PencilLine aria-hidden="true" />
                Editar informações
              </ActionButton>
            </div>
            <ResumeSummary resume={resume} onEdit={(step) => router.push(`${ROUTES.editor}?etapa=${step}`)} />
          </section>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <ResumePreviewPane template={template} />
          <PrimaryButton size="lg" href={ROUTES.checkout} className="w-full">
            Continuar para finalizar
            <ArrowRight aria-hidden="true" className="transition-transform group-hover/action:translate-x-0.5" />
          </PrimaryButton>
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            O download fica disponível somente após a confirmação do pagamento.
          </p>
        </div>
      </div>
    </div>
  )
}
