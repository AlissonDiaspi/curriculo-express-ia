'use client'

import { motion } from 'motion/react'
import { Check, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ActionButton } from '@/components/shared/action-button'

const WILL_DO = [
  'Ajustar clareza, gramática e tom profissional do seu texto.',
  'Manter apenas as informações que você escreveu.',
  'Mostrar a sugestão para você aceitar, editar ou descartar.',
]

export function AiImproveModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-6 rounded-2xl p-6 sm:max-w-md">
        <DialogHeader className="gap-4">
          <motion.span
            initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="flex size-12 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground shadow-[0_8px_24px_-8px_oklch(0.5_0.21_268/0.6)]"
          >
            <Sparkles className="size-5" aria-hidden="true" />
          </motion.span>
          <div className="flex flex-col gap-2">
            <span className="w-fit rounded-full border border-primary/20 bg-secondary px-2.5 py-0.5 font-mono text-[0.7rem] font-medium tracking-wide text-secondary-foreground uppercase">
              Em integração
            </span>
            <DialogTitle className="text-lg font-semibold text-balance">Melhoria de texto com IA</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Este recurso ainda está sendo conectado ao nosso servidor. Por enquanto, seu texto não foi enviado nem
              alterado.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/60 p-4">
          <p className="text-sm font-medium text-foreground">Quando estiver disponível, a IA vai:</p>
          <ul className="flex flex-col gap-2.5">
            {WILL_DO.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <ActionButton onClick={() => onOpenChange(false)} className="w-full">
          Entendi, continuar editando
        </ActionButton>
      </DialogContent>
    </Dialog>
  )
}
