'use client'

import { useState } from 'react'
import { Lightbulb, Sparkles } from 'lucide-react'
import { TextareaField } from '@/components/shared/form-field'
import { AiImproveModal } from '@/components/resume-editor/ai-improve-modal'
import { useResume } from '@/providers/resume-provider'
import { SUMMARY_MAX_LENGTH } from '@/lib/constants'
import { cn } from '@/lib/utils'

const TIPS = [
  'Comece pela sua área ou pelo cargo que você busca.',
  'Cite 2 ou 3 pontos fortes que você consegue comprovar.',
  'Seja direto: 3 a 5 frases costumam ser suficientes.',
]

export function SummaryStep({ showErrors }: { showErrors: boolean }) {
  const { resume, setSummary } = useResume()
  const [aiOpen, setAiOpen] = useState(false)
  const length = resume.summary.length
  const over = length > SUMMARY_MAX_LENGTH
  const ratio = Math.min(length / SUMMARY_MAX_LENGTH, 1)

  return (
    <div className="flex flex-col gap-6">
      <TextareaField
        label="Resumo profissional"
        value={resume.summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Ex.: Profissional de atendimento com 3 anos de experiência no varejo, reconhecida pela organização e pelo cuidado com clientes. Busco uma oportunidade como assistente administrativa."
        rows={7}
        className="min-h-44"
        error={showErrors && over ? `Reduza o texto para até ${SUMMARY_MAX_LENGTH} caracteres.` : undefined}
        trailing={
          <span className={cn('flex items-center gap-2 font-mono text-xs', over ? 'text-destructive' : 'text-muted-foreground')} aria-live="polite">
            <svg viewBox="0 0 20 20" className="size-4 -rotate-90" aria-hidden="true">
              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={50.27}
                strokeDashoffset={50.27 * (1 - ratio)}
                className={cn('transition-[stroke-dashoffset] duration-300', !over && 'text-primary')}
              />
            </svg>
            {length}/{SUMMARY_MAX_LENGTH}
          </span>
        }
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/60 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">Quer uma ajuda com a redação?</p>
          <p className="text-sm leading-relaxed text-muted-foreground">A IA sugere melhorias sem inventar informações.</p>
        </div>
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-primary/25 bg-card px-5 text-sm font-medium text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none"
        >
          <Sparkles className="size-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" aria-hidden="true" />
          Melhorar texto com IA
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Lightbulb className="size-4 text-primary" aria-hidden="true" />
          Dicas de escrita
        </p>
        <ul className="grid gap-2 md:grid-cols-3">
          {TIPS.map((tip) => (
            <li key={tip} className="rounded-xl border border-border bg-card p-3 text-sm leading-relaxed text-muted-foreground">
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <AiImproveModal
  open={aiOpen}
  onOpenChange={setAiOpen}
  text={resume.summary}
  type="summary"
  maxLength={SUMMARY_MAX_LENGTH}
  onApply={(improvedText) => {
    setSummary(improvedText)
  }}
/>
    </div>
  )
}
