'use client'

import { forwardRef, useId } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const inputBase =
  'w-full rounded-xl border border-input bg-card px-3.5 text-base text-foreground shadow-xs transition-all placeholder:text-muted-foreground/70 outline-none hover:border-primary/30 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-ring/15 disabled:opacity-60 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/15 md:text-sm'

interface FieldShellProps {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  className?: string
  trailing?: React.ReactNode
  children: React.ReactNode
}

export function FieldShell({ id, label, required, hint, error, className, trailing, children }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required ? (
            <span className="ml-0.5 text-primary" aria-hidden="true">
              *
            </span>
          ) : (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">(opcional)</span>
          )}
        </label>
        {trailing}
      </div>
      {children}
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="error"
            id={`${id}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 text-sm text-destructive"
          >
            <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p key="hint" id={`${id}-hint`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground">
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

type InputFieldProps = Omit<React.ComponentProps<'input'>, 'id'> & {
  label: string
  hint?: string
  error?: string
  icon?: React.ReactNode
  fieldClassName?: string
}

export const FormField = forwardRef<HTMLInputElement, InputFieldProps>(function FormField(
  { label, hint, error, icon, required, className, fieldClassName, ...props },
  ref,
) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={fieldClassName}>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground [&_svg]:size-4" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(inputBase, 'h-12', icon && 'pl-10', className)}
          {...props}
        />
      </div>
    </FieldShell>
  )
})

type TextareaFieldProps = Omit<React.ComponentProps<'textarea'>, 'id'> & {
  label: string
  hint?: string
  error?: string
  trailing?: React.ReactNode
  fieldClassName?: string
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(function TextareaField(
  { label, hint, error, required, className, trailing, fieldClassName, ...props },
  ref,
) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} trailing={trailing} className={fieldClassName}>
      <textarea
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(inputBase, 'min-h-32 resize-y py-3 leading-relaxed', className)}
        {...props}
      />
    </FieldShell>
  )
})

export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const id = useId()
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-foreground select-none">
      <span className="relative flex size-5 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer size-5 cursor-pointer appearance-none rounded-md border border-input bg-card transition-colors checked:border-primary checked:bg-primary focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none"
        />
        <svg
          viewBox="0 0 16 16"
          className="pointer-events-none absolute size-3.5 scale-50 text-primary-foreground opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100"
          aria-hidden="true"
        >
          <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {label}
    </label>
  )
}
