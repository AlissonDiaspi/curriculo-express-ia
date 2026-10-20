'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, ChevronDown, Trash2 } from 'lucide-react'
import { ConfirmationModal } from '@/components/shared/confirmation-modal'
import { cn } from '@/lib/utils'

/** Collapsible shell shared by ExperienceCard and EducationCard. */
export function EntryCard({
  title,
  subtitle,
  meta,
  open,
  onToggle,
  invalid,
  removeLabel,
  onRemove,
  children,
}: {
  title: string
  subtitle?: string
  meta: string
  open: boolean
  onToggle: () => void
  invalid?: boolean
  removeLabel: string
  onRemove: () => void
  children: React.ReactNode
}) {
  const [confirming, setConfirming] = useState(false)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow]',
        invalid ? 'border-destructive/40' : open ? 'border-primary/20 shadow-[0_12px_32px_-20px_oklch(0.5_0.21_268/0.35)]' : 'border-border',
      )}
    >
      <div className="flex items-center gap-2 p-2 pl-4">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-2 text-left focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none"
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <span className={cn('truncate text-sm font-semibold', title ? 'text-foreground' : 'text-muted-foreground')}>
              {title || 'Novo item'}
              {subtitle && <span className="font-normal text-muted-foreground"> · {subtitle}</span>}
            </span>
            <span className="truncate text-xs text-muted-foreground">{meta}</span>
          </div>
          {invalid && !open && <AlertCircle className="size-4 shrink-0 text-destructive" aria-label="Há campos pendentes" />}
          <ChevronDown
            className={cn('size-4 shrink-0 text-muted-foreground transition-transform duration-300', open && 'rotate-180')}
            aria-hidden="true"
          />
          <span className="sr-only">{open ? 'Recolher' : 'Expandir'}</span>
        </button>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/8 hover:text-destructive focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none"
          aria-label={removeLabel}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-t border-border p-4 md:p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        open={confirming}
        onOpenChange={setConfirming}
        title={`${removeLabel}?`}
        description="As informações preenchidas neste item serão descartadas. Essa ação não pode ser desfeita."
        confirmLabel="Remover"
        destructive
        onConfirm={onRemove}
      />
    </motion.li>
  )
}
