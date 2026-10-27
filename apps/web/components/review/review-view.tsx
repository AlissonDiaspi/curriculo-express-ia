
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  Download,
  FileText,
  FilePenLine,
  LayoutTemplate,
  LoaderCircle,
  PencilLine,
} from 'lucide-react'

import { toast } from 'sonner'

import { ActionButton } from '@/components/shared/action-button'
import { ResumeProgress } from '@/components/resume-editor/resume-progress'
import { ResumeSummary } from '@/components/resume-editor/resume-summary'
import { TemplateThumbnail } from '@/components/templates/template-thumbnail'
import { ResumePreviewPane } from '@/components/review/resume-preview-pane'

import { useResume } from '@/providers/resume-provider'
import { getTemplateById } from '@/lib/templates'
import { ROUTES } from '@/lib/constants'
import {
  api,
  type ResumeDownloadFormat,
} from '@/lib/api'

export function ReviewView() {
  const router = useRouter()

  const { resume, resumeId, templateId } = useResume()

  const template = getTemplateById(templateId)

  const [downloading, setDownloading] =
    useState<ResumeDownloadFormat | null>(null)

  async function handleDownload(
    format: ResumeDownloadFormat,
  ) {
    if (!resumeId) {
      toast.error(
        'Não foi possível identificar seu currículo.',
      )
      return
    }

    if (downloading) {
      return
    }

    setDownloading(format)

    try {
      await api.downloadResume(resumeId, format)

      toast.success(
        format === 'pdf'
          ? 'Download do PDF iniciado!'
          : 'Download do Word iniciado!',
      )
    } catch (error) {
      console.error(
        'Erro ao baixar currículo:',
        error,
      )

      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível baixar o currículo.',
      )
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-10 pb-20 md:px-6 md:pt-14">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-3">
        <span className="font-mono text-xs font-medium tracking-wide text-primary uppercase">
          Etapa final
        </span>

        <h1 className="font-display text-3xl font-semibold tracking-tight text-balance text-foreground md:text-4xl">
          Seu currículo está quase pronto!
        </h1>

        <p className="max-w-2xl leading-relaxed text-pretty text-muted-foreground">
          Confira suas informações e o modelo escolhido.
          Quando estiver tudo certo, baixe seu currículo
          gratuitamente em PDF ou Word.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        {/* Coluna esquerda */}
        <div className="flex flex-col gap-6">
          <section
            aria-labelledby="template-title"
            className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4"
          >
            {template && (
              <div className="w-20 shrink-0 overflow-hidden rounded-lg border border-border">
                <TemplateThumbnail
                  template={template}
                  sizes="80px"
                />
              </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2
                id="template-title"
                className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
              >
                Modelo selecionado
              </h2>

              <p className="truncate font-display font-semibold text-foreground">
                {template?.name ?? 'Nenhum'}
              </p>
            </div>

            <ActionButton
              variant="secondary"
              size="sm"
              href={ROUTES.templates}
            >
              <LayoutTemplate aria-hidden="true" />
              Trocar
            </ActionButton>
          </section>

          <ResumeProgress resume={resume} />

          <section
            aria-labelledby="info-title"
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h2
                id="info-title"
                className="font-display text-lg font-semibold text-foreground"
              >
                Suas informações
              </h2>

              <ActionButton
                variant="ghost"
                size="sm"
                href={ROUTES.editor}
              >
                <PencilLine aria-hidden="true" />
                Editar informações
              </ActionButton>
            </div>

            <ResumeSummary
              resume={resume}
              onEdit={(step) =>
                router.push(
                  `${ROUTES.editor}?etapa=${step}`,
                )
              }
            />
          </section>
        </div>

        {/* Coluna direita */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <ResumePreviewPane template={template} />

          {/* Downloads gratuitos */}
          <section
            aria-labelledby="download-title"
            className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5"
          >
            <div className="flex flex-col gap-1">
              <h2
                id="download-title"
                className="font-display text-lg font-semibold text-foreground"
              >
                Baixar meu currículo
              </h2>

              <p className="text-sm text-muted-foreground">
                Escolha o formato desejado.
                Ambos estão disponíveis gratuitamente.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* PDF */}
              <button
                type="button"
                onClick={() =>
                  void handleDownload('pdf')
                }
                disabled={
                  downloading !== null || !resumeId
                }
                className="group flex min-h-14 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloading === 'pdf' ? (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <FileText
                    className="size-4"
                    aria-hidden="true"
                  />
                )}

                {downloading === 'pdf'
                  ? 'Gerando PDF...'
                  : 'Baixar PDF'}

                {downloading !== 'pdf' && (
                  <Download
                    className="size-4"
                    aria-hidden="true"
                  />
                )}
              </button>

              {/* Word */}
              <button
                type="button"
                onClick={() =>
                  void handleDownload('docx')
                }
                disabled={
                  downloading !== null || !resumeId
                }
                className="group flex min-h-14 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloading === 'docx' ? (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <FilePenLine
                    className="size-4"
                    aria-hidden="true"
                  />
                )}

                {downloading === 'docx'
                  ? 'Gerando Word...'
                  : 'Baixar Word'}

                {downloading !== 'docx' && (
                  <Download
                    className="size-4"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>

            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              PDF para compartilhar e Word para editar.
              Nenhum pagamento necessário.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
