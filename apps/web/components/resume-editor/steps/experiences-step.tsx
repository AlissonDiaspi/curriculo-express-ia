'use client'

import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Briefcase, Plus } from 'lucide-react'
import { ExperienceCard } from '@/components/resume-editor/experience-card'
import { EmptyState } from '@/components/shared/states'
import { ActionButton } from '@/components/shared/action-button'
import { useResume } from '@/providers/resume-provider'

export function ExperiencesStep({ showErrors }: { showErrors: boolean }) {
  const { resume, addExperience, updateExperience, removeExperience } = useResume()
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const handleAdd = () => {
    const id = addExperience()
    setOpenIds((prev) => new Set(prev).add(id))
  }

  if (resume.experiences.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Nenhuma experiência adicionada"
        description="Está buscando o primeiro emprego? Tudo bem — você pode avançar sem preencher esta etapa e destacar sua formação e habilidades."
        action={
          <ActionButton onClick={handleAdd}>
            <Plus aria-hidden="true" />
            Adicionar experiência
          </ActionButton>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {resume.experiences.map((exp) => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              open={openIds.has(exp.id)}
              onToggle={() => toggle(exp.id)}
              showErrors={showErrors}
              onChange={(patch) => updateExperience(exp.id, patch)}
              onRemove={() => removeExperience(exp.id)}
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
        Adicionar outra experiência
      </button>
    </div>
  )
}
