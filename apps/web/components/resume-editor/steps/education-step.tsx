'use client'

import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { GraduationCap, Plus } from 'lucide-react'
import { EducationCard } from '@/components/resume-editor/education-card'
import { EmptyState } from '@/components/shared/states'
import { ActionButton } from '@/components/shared/action-button'
import { useResume } from '@/providers/resume-provider'

export function EducationStep({ showErrors }: { showErrors: boolean }) {
  const { resume, addEducation, updateEducation, removeEducation } = useResume()
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const handleAdd = () => {
    const id = addEducation()
    setOpenIds((prev) => new Set(prev).add(id))
  }

  if (resume.education.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Nenhuma formação adicionada"
        description="Inclua ensino médio, cursos técnicos, graduação ou cursos livres relevantes para a vaga."
        action={
          <ActionButton onClick={handleAdd}>
            <Plus aria-hidden="true" />
            Adicionar formação
          </ActionButton>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {resume.education.map((edu) => (
            <EducationCard
              key={edu.id}
              education={edu}
              open={openIds.has(edu.id)}
              onToggle={() => toggle(edu.id)}
              showErrors={showErrors}
              onChange={(patch) => updateEducation(edu.id, patch)}
              onRemove={() => removeEducation(edu.id)}
            />
          ))}
        </AnimatePresence>
      </ul>
      <button
        type="button"
        onClick={handleAdd}
        className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-dashed border-input text-sm font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-card hover:text-primary focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none"
      >
        <Plus className="size-4" aria-hidden="true" />
        Adicionar outra formação
      </button>
    </div>
  )
}
