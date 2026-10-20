import type { Metadata } from 'next'
import { FlowHeader } from '@/components/layout/flow-header'
import { ResumeEditor } from '@/components/resume-editor/resume-editor'

export const metadata: Metadata = {
  title: 'Criar currículo',
  description: 'Preencha suas informações passo a passo e monte um currículo profissional.',
}

export default async function CreateResumePage({ searchParams }: { searchParams: Promise<{ etapa?: string }> }) {
  const { etapa } = await searchParams
  return (
    <>
      <FlowHeader stage="editor" />
      <main className="min-h-dvh bg-surface/40">
        <ResumeEditor initialStepId={etapa} />
      </main>
    </>
  )
}
