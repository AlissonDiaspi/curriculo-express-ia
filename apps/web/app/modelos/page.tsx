import type { Metadata } from 'next'
import { FlowHeader } from '@/components/layout/flow-header'
import { RequireResume } from '@/components/flow/require-resume'
import { TemplateSelector } from '@/components/templates/template-selector'

export const metadata: Metadata = {
  title: 'Escolher modelo',
  description: 'Escolha a apresentação ideal para o seu currículo.',
}

export default function TemplatesPage() {
  return (
    <>
      <FlowHeader stage="templates" />
      <main className="min-h-dvh bg-surface/40">
        <RequireResume>
          <TemplateSelector />
        </RequireResume>
      </main>
    </>
  )
}
