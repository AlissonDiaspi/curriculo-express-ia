'use client'

import { Check } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ActionButton } from '@/components/shared/action-button'
import { TemplateThumbnail } from '@/components/templates/template-thumbnail'
import type { ResumeTemplate } from '@/types/template'

export function TemplatePreviewModal({
  template,
  onOpenChange,
  selected,
  onSelect,
}: {
  template: ResumeTemplate | null
  onOpenChange: (open: boolean) => void
  selected?: boolean
  onSelect?: (id: string) => void
}) {
  return (
    <Dialog open={template !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-3xl">
        {template && (
          <div className="grid max-h-[92dvh] overflow-y-auto md:grid-cols-[1.2fr_1fr]">
            <div className="border-b border-border bg-surface p-5 md:border-r md:border-b-0 md:p-8">
              <div className="mx-auto max-w-sm overflow-hidden rounded-lg border border-border shadow-[0_24px_48px_-24px_oklch(0.22_0.045_265/0.35)]">
                <TemplateThumbnail template={template} variant="preview" sizes="(min-width: 768px) 400px, 90vw" />
              </div>
            </div>
            <div className="flex flex-col gap-6 p-6 md:p-8">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl font-semibold tracking-tight">{template.name}</DialogTitle>
                <DialogDescription className="leading-relaxed">{template.description}</DialogDescription>
              </DialogHeader>
              {!template.previewUrl && (
                <p className="rounded-xl border border-dashed border-primary/25 bg-secondary/60 p-3 text-sm leading-relaxed text-muted-foreground">
                  A visualização ampliada do modelo oficial será exibida aqui assim que os arquivos forem adicionados.
                </p>
              )}
              <div className="mt-auto flex flex-col gap-2">
                {onSelect && (
                  <ActionButton
                    variant={selected ? 'secondary' : 'primary'}
                    size="lg"
                    onClick={() => {
                      onSelect(template.id)
                      onOpenChange(false)
                    }}
                  >
                    {selected ? (
                      <>
                        <Check aria-hidden="true" />
                        Modelo selecionado
                      </>
                    ) : (
                      'Usar este modelo'
                    )}
                  </ActionButton>
                )}
                <ActionButton variant="ghost" onClick={() => onOpenChange(false)}>
                  Fechar
                </ActionButton>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
