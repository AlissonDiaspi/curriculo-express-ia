'use client'

import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { MAX_SKILLS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'Comunicação',
  'Trabalho em equipe',
  'Atendimento ao cliente',
  'Organização',
  'Pacote Office',
  'Excel',
  'Resolução de problemas',
  'Inglês',
]

export function SkillTagInput({
  skills,
  onAdd,
  onRemove,
}: {
  skills: string[]
  onAdd: (skill: string) => boolean
  onRemove: (skill: string) => void
}) {
  const id = useId()
  const [value, setValue] = useState('')
  const full = skills.length >= MAX_SKILLS

  const add = (raw: string) => {
    const skill = raw.trim().replace(/\s+/g, ' ')
    if (!skill) return
    if (full) {
      toast.error(`Você pode adicionar até ${MAX_SKILLS} habilidades.`)
      return
    }
    if (skill.length > 40) {
      toast.error('Use no máximo 40 caracteres por habilidade.')
      return
    }
    if (!onAdd(skill)) {
      toast.info(`"${skill}" já está na sua lista.`)
      return
    }
    setValue('')
  }

  const pending = SUGGESTIONS.filter((s) => !skills.some((k) => k.toLowerCase() === s.toLowerCase()))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          Adicionar habilidade
        </label>
        <div className="flex gap-2">
          <input
            id={id}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                add(value)
              } else if (e.key === 'Backspace' && !value && skills.length) {
                onRemove(skills[skills.length - 1])
              }
            }}
            placeholder="Digite e pressione Enter"
            disabled={full}
            aria-describedby={`${id}-hint`}
            className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-card px-3.5 text-base text-foreground shadow-xs outline-none transition-all placeholder:text-muted-foreground/70 hover:border-primary/30 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-ring/15 disabled:opacity-60 md:text-sm"
          />
          <button
            type="button"
            onClick={() => add(value)}
            disabled={!value.trim() || full}
            className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Adicionar</span>
            <span className="sr-only sm:hidden">Adicionar habilidade</span>
          </button>
        </div>
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          Pressione Enter ou vírgula para adicionar. {skills.length}/{MAX_SKILLS}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-foreground">Suas habilidades</span>
        {skills.length === 0 ? (
          <p className="rounded-xl border border-dashed border-input bg-surface/60 px-4 py-5 text-center text-sm text-muted-foreground">
            Nenhuma habilidade adicionada ainda.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2" aria-live="polite">
            <AnimatePresence initial={false}>
              {skills.map((skill) => (
                <motion.li
                  key={skill}
                  layout
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.15 } }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex items-center gap-1 rounded-full border border-primary/15 bg-secondary py-1 pr-1 pl-3.5 text-sm font-medium text-secondary-foreground"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => onRemove(skill)}
                    className="flex size-7 items-center justify-center rounded-full text-secondary-foreground/70 transition-colors hover:bg-primary/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                    aria-label={`Remover ${skill}`}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {pending.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">Sugestões</span>
            <span className="text-xs text-muted-foreground">Toque para adicionar apenas as que você realmente possui.</span>
          </div>
          <ul className="flex flex-wrap gap-2">
            {pending.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => add(s)}
                  disabled={full}
                  className={cn(
                    'inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-input bg-card px-3.5 text-sm text-muted-foreground transition-all',
                    'hover:border-primary/40 hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none disabled:opacity-40',
                  )}
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
