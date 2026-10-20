'use client'

import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import type { EditorStep } from '@/types/resume'
import { cn } from '@/lib/utils'

export function StepIndicator({
  steps,
  current,
  maxReachable,
  onSelect,
}: {
  steps: EditorStep[]
  current: number
  /** Highest step index the user may jump to. */
  maxReachable: number
  onSelect: (index: number) => void
}) {
  return (
    <nav aria-label="Etapas do currículo">
      {/* Desktop */}
      <ol className="hidden flex-col gap-1 lg:flex">
        {steps.map((step, i) => {
          const done = i < maxReachable
          const active = i === current
          const reachable = i <= maxReachable
          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onSelect(i)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none disabled:cursor-not-allowed',
                  active ? 'text-foreground' : reachable ? 'text-foreground/80 hover:bg-accent' : 'text-muted-foreground/70',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="step-active-bg"
                    className="absolute inset-0 rounded-xl border border-primary/15 bg-card shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <span
                  className={cn(
                    'relative flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-semibold transition-all duration-300',
                    done && !active && 'border-transparent bg-success text-success-foreground',
                    active && 'border-transparent bg-brand-gradient text-primary-foreground shadow-[0_4px_12px_-4px_oklch(0.5_0.21_268/0.6)]',
                    !done && !active && 'border-input bg-card',
                  )}
                >
                  {done && !active ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : i + 1}
                </span>
                <span className="relative flex flex-col">
                  <span className="text-sm font-medium">{step.shortTitle}</span>
                </span>
                {done && !active && <span className="sr-only">(concluída)</span>}
              </button>
            </li>
          )
        })}
      </ol>

      {/* Mobile / tablet */}
      <div className="flex flex-col gap-3 lg:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold text-foreground">{steps[current].title}</span>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {current + 1}/{steps.length}
          </span>
        </div>
        <ol className="flex gap-1.5">
          {steps.map((step, i) => (
            <li key={step.id} className="flex-1">
              <button
                type="button"
                disabled={i > maxReachable}
                onClick={() => onSelect(i)}
                aria-label={`Etapa ${i + 1}: ${step.title}`}
                aria-current={i === current ? 'step' : undefined}
                className="flex h-6 w-full items-center disabled:cursor-not-allowed"
              >
                <span className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full bg-brand-gradient"
                    initial={false}
                    animate={{ width: i <= current ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
