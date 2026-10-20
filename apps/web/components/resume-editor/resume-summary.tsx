'use client'

import { Pencil } from 'lucide-react'
import type { EditorStepId, ResumeContent } from '@/types/resume'
import { formatPeriod } from '@/lib/resume-validation'

function SummaryBlock({
  title,
  onEdit,
  empty,
  children,
}: {
  title: string
  onEdit: () => void
  empty?: string
  children?: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-primary transition-colors hover:bg-secondary focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none"
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          Editar
          <span className="sr-only">{title}</span>
        </button>
      </div>
      {empty ? <p className="text-sm text-muted-foreground italic">{empty}</p> : children}
    </section>
  )
}

/** Read-only overview of the in-memory resume, with per-section edit shortcuts. */
export function ResumeSummary({ resume, onEdit }: { resume: ResumeContent; onEdit: (step: EditorStepId) => void }) {
  const p = resume.personal
  const contact = [p.email, p.phone, p.city, p.linkedin, p.website].filter(Boolean)

  return (
    <div className="flex flex-col gap-3">
      <SummaryBlock title="Dados pessoais" onEdit={() => onEdit('personal')} empty={p.fullName ? undefined : 'Não preenchido'}>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-foreground">{p.fullName}</p>
          <p className="text-sm leading-relaxed break-words text-muted-foreground">{contact.join(' · ')}</p>
        </div>
      </SummaryBlock>

      <SummaryBlock title="Resumo" onEdit={() => onEdit('summary')} empty={resume.summary.trim() ? undefined : 'Nenhum resumo adicionado'}>
        <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{resume.summary}</p>
      </SummaryBlock>

      <SummaryBlock
        title={`Experiências (${resume.experiences.length})`}
        onEdit={() => onEdit('experiences')}
        empty={resume.experiences.length ? undefined : 'Nenhuma experiência adicionada'}
      >
        <ul className="flex flex-col gap-3">
          {resume.experiences.map((e) => (
            <li key={e.id} className="flex flex-col gap-0.5 border-l-2 border-primary/20 pl-3">
              <span className="text-sm font-medium text-foreground">
                {e.role} <span className="font-normal text-muted-foreground">· {e.company}</span>
              </span>
              <span className="text-xs text-muted-foreground">{formatPeriod(e.startDate, e.endDate, e.isCurrent, 'atual')}</span>
            </li>
          ))}
        </ul>
      </SummaryBlock>

      <SummaryBlock
        title={`Formação (${resume.education.length})`}
        onEdit={() => onEdit('education')}
        empty={resume.education.length ? undefined : 'Nenhuma formação adicionada'}
      >
        <ul className="flex flex-col gap-3">
          {resume.education.map((e) => (
            <li key={e.id} className="flex flex-col gap-0.5 border-l-2 border-primary/20 pl-3">
              <span className="text-sm font-medium text-foreground">
                {e.course} <span className="font-normal text-muted-foreground">· {e.institution}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {formatPeriod(e.startDate, e.endDate, e.inProgress, 'em andamento')}
              </span>
            </li>
          ))}
        </ul>
      </SummaryBlock>

      <SummaryBlock
        title={`Habilidades (${resume.skills.length})`}
        onEdit={() => onEdit('skills')}
        empty={resume.skills.length ? undefined : 'Nenhuma habilidade adicionada'}
      >
        <ul className="flex flex-wrap gap-1.5">
          {resume.skills.map((s) => (
            <li key={s} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {s}
            </li>
          ))}
        </ul>
      </SummaryBlock>
    </div>
  )
}
