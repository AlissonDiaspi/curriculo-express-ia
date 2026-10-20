'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Check, Eye } from 'lucide-react'
import type { ResumeTemplate } from '@/types/template'
import { TemplateThumbnail } from '@/components/templates/template-thumbnail'
import { staggerItem } from '@/components/shared/animated-section'
import { cn } from '@/lib/utils'

export function TemplateCard({
  template,
  selected,
  onSelect,
  onPreview,
}: {
  template: ResumeTemplate
  selected?: boolean
  /** When provided the card becomes selectable (radio behavior). */
  onSelect?: () => void
  onPreview: () => void
}) {
  const selectable = Boolean(onSelect)

  return (
    <motion.article
      variants={staggerItem}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300',
        selected
          ? 'border-primary shadow-[0_0_0_4px_oklch(0.5_0.21_268/0.12),0_24px_48px_-24px_oklch(0.5_0.21_268/0.45)]'
          : 'border-border shadow-[0_1px_2px_oklch(0.22_0.045_265/0.04)] hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_24px_48px_-24px_oklch(0.5_0.21_268/0.3)]',
      )}
    >
      <div className="relative overflow-hidden border-b border-border">
        <TemplateThumbnail template={template} className="transition-transform duration-500 group-hover:scale-[1.02]" />
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-foreground/30 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            onClick={onPreview}
            className="relative z-10 inline-flex h-10 items-center gap-2 rounded-full bg-card px-4 text-sm font-medium text-foreground shadow-lg transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none"
          >
            <Eye className="size-4" aria-hidden="true" />
            Visualizar modelo
          </button>
        </div>
        <AnimatePresence>
          {selected && (
            <motion.span
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground shadow-lg"
              aria-hidden="true"
            >
              <Check className="size-4" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-foreground">{template.name}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{template.description}</p>
          </div>
        </div>
        <div className="mt-auto flex items-center gap-2 pt-1">
          {selectable ? (
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={onSelect}
              className={cn(
                'inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border text-sm font-medium transition-all focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none',
                selected
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary/30 hover:bg-accent',
              )}
            >
              {selected ? (
                <>
                  <Check className="size-4" aria-hidden="true" />
                  Selecionado
                </>
              ) : (
                'Selecionar'
              )}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onPreview}
            className={cn(
              'inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-accent focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none',
              !selectable && 'flex-1',
            )}
            aria-label={selectable ? `Visualizar ${template.name}` : undefined}
          >
            <Eye className="size-4" aria-hidden="true" />
            {selectable ? <span className="sr-only sm:not-sr-only">Visualizar</span> : 'Visualizar modelo'}
          </button>
        </div>
      </div>
    </motion.article>
  )
}
