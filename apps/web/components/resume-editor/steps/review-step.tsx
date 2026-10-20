'use client'

import { motion } from 'motion/react'
import { CircleCheck } from 'lucide-react'
import type { EditorStepId } from '@/types/resume'
import { ResumeSummary } from '@/components/resume-editor/resume-summary'
import { useResume } from '@/providers/resume-provider'

export function ReviewStep({ onEdit }: { onEdit: (step: EditorStepId) => void }) {
  const { resume } = useResume()

  return (
    <div className="flex flex-col gap-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-start gap-3 rounded-2xl border border-success/25 bg-success/8 p-4"
        role="status"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.25 }}
        >
          <CircleCheck className="size-5 text-success" aria-hidden="true" />
        </motion.span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-foreground">Informações prontas para revisão final</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Confira cada seção abaixo. Em seguida, você escolhe o modelo visual do seu currículo.
          </p>
        </div>
      </motion.div>
      <ResumeSummary resume={resume} onEdit={onEdit} />
    </div>
  )
}
