import type { Metadata } from 'next'
import { FlowHeader } from '@/components/layout/flow-header'
import { RequireResume } from '@/components/flow/require-resume'
import { CheckoutView } from '@/components/checkout/checkout-view'

export const metadata: Metadata = {
  title: 'Finalização',
  description: 'Finalize seu currículo com pagamento único.',
}

export default function CheckoutPage() {
  return (
    <>
      <FlowHeader stage="checkout" />
      <main className="min-h-dvh bg-surface/40">
        <RequireResume requireTemplate>
          <CheckoutView />
        </RequireResume>
      </main>
    </>
  )
}
