'use client'

import { CheckboxField, FormField } from '@/components/shared/form-field'
import { EntryCard } from '@/components/resume-editor/entry-card'
import type { Education } from '@/types/resume'
import { formatPeriod, validateEducation } from '@/lib/resume-validation'

export function EducationCard({
  education,
  open,
  onToggle,
  showErrors,
  onChange,
  onRemove,
}: {
  education: Education
  open: boolean
  onToggle: () => void
  showErrors: boolean
  onChange: (patch: Partial<Education>) => void
  onRemove: () => void
}) {
  const errors = showErrors ? validateEducation(education) : {}
  const invalid = Object.keys(errors).length > 0

  return (
    <EntryCard
      title={education.course}
      subtitle={education.institution}
      meta={formatPeriod(education.startDate, education.endDate, education.inProgress, 'em andamento')}
      open={open || invalid}
      onToggle={onToggle}
      invalid={invalid}
      removeLabel="Remover formação"
      onRemove={onRemove}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Instituição"
          required
          value={education.institution}
          onChange={(e) => onChange({ institution: e.target.value })}
          placeholder="Ex.: Escola Estadual Santos Dumont"
          error={errors.institution}
        />
        <FormField
          label="Curso"
          required
          value={education.course}
          onChange={(e) => onChange({ course: e.target.value })}
          placeholder="Ex.: Ensino Médio, Técnico em Administração"
          error={errors.course}
        />
        <FormField
          label="Início"
          required
          type="month"
          value={education.startDate}
          onChange={(e) => onChange({ startDate: e.target.value })}
          error={errors.startDate}
        />
        <div className="flex flex-col gap-3">
          <FormField
            label="Conclusão"
            required={!education.inProgress}
            type="month"
            value={education.inProgress ? '' : education.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            disabled={education.inProgress}
            error={errors.endDate}
          />
          <CheckboxField
            label="Em andamento"
            checked={education.inProgress}
            onChange={(checked) => onChange({ inProgress: checked, endDate: checked ? '' : education.endDate })}
          />
        </div>
      </div>
    </EntryCard>
  )
}
