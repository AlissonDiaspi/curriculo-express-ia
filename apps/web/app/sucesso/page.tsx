import type { Metadata } from 'next'
import { FlowHeader } from '@/components/layout/flow-header'
import { SuccessView } from '@/components/success/success-view'

export const metadata: Metadata = {
  title: 'Confirmação',
  description: 'Confirmação da compra e download do seu currículo.',
  robots: { index: false },
}

export default function SuccessPage() {
  return (
    <>
      <FlowHeader stage="success" />
      <main className="min-h-dvh bg-surface/40">
        <SuccessView />
      </main>
    </>
  )
}
