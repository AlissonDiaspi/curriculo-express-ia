'use client'

import { motion, useReducedMotion } from 'motion/react'
import { Check, Download, FileText } from 'lucide-react'
import { ActionButton } from '@/components/shared/action-button'
import { PendingIntegrationNotice } from '@/components/shared/states'
import { useResume } from '@/providers/resume-provider'
import { getTemplateById } from '@/lib/templates'
import { ROUTES } from '@/lib/constants'

/** Filled in by the backend after a confirmed purchase. `null` keeps the button disabled. */
export interface DownloadLinks {
  pdf: string | null
  docx: string | null
}

const EASE = [0.22, 1, 0.36, 1] as const

export function SuccessView({ downloads = { pdf: null, docx: null } }: { downloads?: DownloadLinks }) {
  const reduce = useReducedMotion()
  const { resume, templateId } = useResume()
  const template = getTemplateById(templateId)
  const name = resume.personal.fullName.trim()

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-4 pt-12 pb-20 text-center md:pt-20">
      <span className="rounded-full border border-primary/20 bg-secondary px-3 py-1 font-mono text-[0.7rem] font-medium tracking-wide text-primary uppercase">
        Demonstração · aguardando confirmação do backend
      </span>

      <motion.div
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative flex size-20 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground shadow-[0_20px_40px_-12px_oklch(0.5_0.21_268/0.6)]"
      >
        {!reduce && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-primary"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
          />
        )}
        <svg viewBox="0 0 24 24" className="size-9" fill="none" aria-hidden="true">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
          />
        </svg>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
        className="flex flex-col gap-3"
      >
        <h1 className="font-display text-3xl font-semibold tracking-tight text-balance text-foreground md:text-4xl">
          {name ? `Obrigado, ${name.split(' ')[0]}!` : 'Obrigado!'}
        </h1>
        <p className="leading-relaxed text-pretty text-muted-foreground">
          Assim que o pagamento for confirmado, seu currículo ficará disponível para download nesta página.
        </p>
      </motion.div>

      <motion.section
        aria-labelledby="success-summary"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65, ease: EASE }}
        className="flex w-full flex-col gap-6 rounded-3xl border border-border bg-card p-6 text-left md:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col">
            <h2 id="success-summary" className="truncate font-medium text-foreground">
              {name || 'Seu currículo'}
            </h2>
            <p className="text-sm text-muted-foreground">Modelo: {template?.name ?? 'não selecionado'}</p>
          </div>
        </div>

        <ul className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Experiências', value: resume.experiences.length },
            { label: 'Formações', value: resume.education.length },
            { label: 'Habilidades', value: resume.skills.length },
          ].map((item) => (
            <li key={item.label} className="flex flex-col gap-0.5 rounded-2xl bg-surface/70 p-3">
              <span className="font-display text-xl font-semibold tabular-nums text-foreground">{item.value}</span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Download</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <DownloadButton label="Baixar PDF" href={downloads.pdf} />
            <DownloadButton label="Baixar DOCX" href={downloads.docx} />
          </div>
          {(!downloads.pdf || !downloads.docx) && (
            <PendingIntegrationNotice title="Arquivos ainda não disponíveis">
              Os links de download serão liberados pelo servidor após a confirmação da compra.
            </PendingIntegrationNotice>
          )}
        </div>
      </motion.section>

      <ActionButton variant="ghost" href={ROUTES.home}>
        <Check aria-hidden="true" />
        Voltar para o início
      </ActionButton>
    </div>
  )
}

function DownloadButton({ label, href }: { label: string; href: string | null }) {
  if (href) {
    return (
      <ActionButton variant="secondary" href={href} className="w-full">
        <Download aria-hidden="true" />
        {label}
      </ActionButton>
    )
  }
  return (
    <ActionButton variant="secondary" disabled className="w-full">
      <Download aria-hidden="true" />
      {label}
    </ActionButton>
  )
}
