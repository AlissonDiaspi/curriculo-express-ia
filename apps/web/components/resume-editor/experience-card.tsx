'use client'

import { CheckboxField, FormField, TextareaField } from '@/components/shared/form-field'
import { EntryCard } from '@/components/resume-editor/entry-card'
import type { Experience } from '@/types/resume'
import { formatPeriod, validateExperience } from '@/lib/resume-validation'

export function ExperienceCard({
  experience,
  open,
  onToggle,
  showErrors,
  onChange,
  onRemove,
}: {
  experience: Experience
  open: boolean
  onToggle: () => void
  showErrors: boolean
  onChange: (patch: Partial<Experience>) => void
  onRemove: () => void
}) {
  const errors = showErrors ? validateExperience(experience) : {}
  const invalid = Object.keys(errors).length > 0

  return (
    <EntryCard
      title={experience.role}
      subtitle={experience.company}
      meta={formatPeriod(experience.startDate, experience.endDate, experience.isCurrent, 'atual')}
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
          onChange={(e) => onChange({ company: e.target.value })}
          placeholder="Ex.: Mercado Bom Preço"
          error={errors.company}
          autoComplete="organization"
        />
        <FormField
          label="Cargo"
          required
          value={experience.role}
          onChange={(e) => onChange({ role: e.target.value })}
          placeholder="Ex.: Atendente"
          error={errors.role}
          autoComplete="organization-title"
        />
        <FormField
          label="Início"
          required
          type="month"
          value={experience.startDate}
          onChange={(e) => onChange({ startDate: e.target.value })}
          error={errors.startDate}
        />
        <div className="flex flex-col gap-3">
          <FormField
            label="Término"
            required={!experience.isCurrent}
            type="month"
            value={experience.isCurrent ? '' : experience.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            disabled={experience.isCurrent}
            error={errors.endDate}
          />
          <CheckboxField
            label="Trabalho atualmente aqui"
            checked={experience.isCurrent}
            onChange={(checked) => onChange({ isCurrent: checked, endDate: checked ? '' : experience.endDate })}
          />
        </div>
        <TextareaField
          label="Descrição das atividades"
          fieldClassName="md:col-span-2"
          value={experience.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Conte, com suas palavras, o que você fazia no dia a dia."
          hint="Descreva apenas o que você realmente fez. Você poderá revisar a redação depois."
          rows={4}
        />
      </div>
    </EntryCard>
  )
}
