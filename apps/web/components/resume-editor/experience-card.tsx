
'use client'

import { useState } from 'react'
import { FilePenLine } from 'lucide-react'

import {
  CheckboxField,
  FormField,
  TextareaField,
} from '@/components/shared/form-field'

import { EntryCard } from '@/components/resume-editor/entry-card'
import { AiImproveModal } from '@/components/resume-editor/ai-improve-modal'

import type { Experience } from '@/types/resume'

import {
  formatPeriod,
  validateExperience,
} from '@/lib/resume-validation'

interface ExperienceCardProps {
  experience: Experience
  open: boolean
  onToggle: () => void
  showErrors: boolean
  onChange: (patch: Partial<Experience>) => void
  onRemove: () => void
}

export function ExperienceCard({
  experience,
  open,
  onToggle,
  showErrors,
  onChange,
  onRemove,
}: ExperienceCardProps) {
  const [aiOpen, setAiOpen] = useState(false)

  const errors = showErrors
    ? validateExperience(experience)
    : {}

  const invalid = Object.keys(errors).length > 0

  return (
    <>
      <EntryCard
        title={experience.role}
        subtitle={experience.company}
        meta={formatPeriod(
          experience.startDate,
          experience.endDate,
          experience.isCurrent,
          'atual',
        )}
        open={open || invalid}
        onToggle={onToggle}
        invalid={invalid}
        removeLabel="Remover experiência"
        onRemove={onRemove}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Empresa"
            required
            value={experience.company}
            onChange={(event) =>
              onChange({
                company: event.target.value,
              })
            }
            placeholder="Ex.: Mercado Bom Preço"
            error={errors.company}
            autoComplete="organization"
          />

          <FormField
            label="Cargo"
            required
            value={experience.role}
            onChange={(event) =>
              onChange({
                role: event.target.value,
              })
            }
            placeholder="Ex.: Atendente"
            error={errors.role}
            autoComplete="organization-title"
          />

          <FormField
            label="Início"
            required
            type="month"
            value={experience.startDate}
            onChange={(event) =>
              onChange({
                startDate: event.target.value,
              })
            }
            error={errors.startDate}
          />

          <div className="flex flex-col gap-3">
            <FormField
              label="Término"
              required={!experience.isCurrent}
              type="month"
              value={
                experience.isCurrent
                  ? ''
                  : experience.endDate
              }
              onChange={(event) =>
                onChange({
                  endDate: event.target.value,
                })
              }
              disabled={experience.isCurrent}
              error={errors.endDate}
            />

            <CheckboxField
              label="Trabalho atualmente aqui"
              checked={experience.isCurrent}
              onChange={(checked) =>
                onChange({
                  isCurrent: checked,
                  endDate: checked
                    ? ''
                    : experience.endDate,
                })
              }
            />
          </div>

          <TextareaField
            label="Descrição das atividades"
            fieldClassName="md:col-span-2"
            value={experience.description}
            onChange={(event) =>
              onChange({
                description: event.target.value,
              })
            }
            placeholder="Conte, com suas palavras, o que você fazia no dia a dia."
            hint="Descreva apenas o que você realmente fez. Você poderá melhorar a redação com IA."
            rows={4}
          />

          <div className="flex justify-end md:col-span-2">
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              disabled={!experience.description.trim()}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-primary/25 bg-card px-5 text-sm font-medium text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FilePenLine
                className="size-4 transition-transform duration-300 group-hover:scale-110"
                aria-hidden="true"
              />
              Melhorar descrição com IA
            </button>
          </div>
        </div>
      </EntryCard>

      <AiImproveModal
        open={aiOpen}
        onOpenChange={setAiOpen}
        text={experience.description}
        type="experience"
        onApply={(improvedText) => {
          onChange({
            description: improvedText,
          })
        }}
      />
    </>
  )
}
