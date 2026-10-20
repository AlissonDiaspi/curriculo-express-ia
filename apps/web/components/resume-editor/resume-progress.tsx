'use client'

import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import type { ResumeContent } from '@/types/resume'
import { validatePersonal } from '@/lib/resume-validation'
import { cn } from '@/lib/utils'

export function getSectionStatus(resume: ResumeContent) {
  return [
    { label: 'Dados pessoais', done: Object.keys(validatePersonal(resume.personal)).length === 0 },
    { label: 'Resumo', done: resume.summary.trim().length > 0 },
    { label: 'Experiências', done: resume.experiences.length > 0 },
    { label: 'Formação', done: resume.education.length > 0 },
    { label: 'Habilidades', done: resume.skills.length > 0 },
  ]
}

export function ResumeProgress({ resume, className }: { resume: ResumeContent; className?: string }) {
  const sections = getSectionStatus(resume)
  const filled = sections.filter((s) => s.done).length
  const percent = Math.round((filled / sections.length) * 100)

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-end justify-between gap-2">
        <span className="text-sm font-medium text-foreground">Seções preenchidas</span>
        <span className="font-mono text-xs text-muted-foreground" aria-hidden="true">
          {filled}/{sections.length}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Seções do currículo preenchidas"
        className="h-2 overflow-hidden rounded-full bg-secondary"
      >
        <motion.div
          className="h-full rounded-full bg-brand-gradient"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <ul className="flex flex-col gap-2">
        {sections.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5 text-sm">
            <span
              className={cn(
                'flex size-4.5 items-center justify-center rounded-full border transition-colors duration-300',
                s.done ? 'border-transparent bg-success text-success-foreground' : 'border-input bg-card',
              )}
              aria-hidden="true"
            >
              {s.done && <Check className="size-3" strokeWidth={3} />}
            </span>
            <span className={s.done ? 'text-foreground' : 'text-muted-foreground'}>{s.label}</span>
            <span className="sr-only">{s.done ? 'preenchida' : 'pendente'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
