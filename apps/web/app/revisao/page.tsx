import type { Metadata } from 'next'
import { FlowHeader } from '@/components/layout/flow-header'
import { RequireResume } from '@/components/flow/require-resume'
import { ReviewView } from '@/components/review/review-view'

export const metadata: Metadata = {
  title: 'Revisão',
  description: 'Revise as informações e o modelo do seu currículo antes de finalizar.',
}

export default function ReviewPage() {
  return (
    <>
      <FlowHeader stage="review" />
      <main className="min-h-dvh bg-surface/40">
        <RequireResume requireTemplate>
          <ReviewView />
        </RequireResume>
      </main>
    </>
  )
}
