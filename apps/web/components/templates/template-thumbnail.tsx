import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import type { ResumeTemplate } from '@/types/template'
import { cn } from '@/lib/utils'

/**
 * Renders the real template image when `thumbnailUrl`/`previewUrl` is set,
 * otherwise an abstract placeholder that is explicitly labeled as such.
 */
export function TemplateThumbnail({
  template,
  variant = 'thumbnail',
  className,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
}: {
  template: ResumeTemplate
  variant?: 'thumbnail' | 'preview'
  className?: string
  sizes?: string
}) {
  const src = variant === 'preview' ? (template.previewUrl ?? template.thumbnailUrl) : template.thumbnailUrl

  return (
    <div className={cn('relative aspect-[210/297] w-full overflow-hidden bg-surface', className)}>
      {src ? (
        <Image src={src} alt={`Pré-visualização do ${template.name}`} fill sizes={sizes} className="object-cover object-top" />
      ) : (
        <div className="absolute inset-0 flex flex-col bg-grid p-[9%]" role="img" aria-label={`Espaço reservado para a imagem do ${template.name}`}>
          <div className="flex flex-col gap-[6%] opacity-60" aria-hidden="true">
            <div className="h-[0.55rem] w-1/2 rounded-full bg-input" />
            <div className="h-[0.35rem] w-1/3 rounded-full bg-input/70" />
          </div>
          <div className="mt-[10%] flex flex-col gap-[0.45rem] opacity-50" aria-hidden="true">
            {[100, 86, 92, 70].map((w, i) => (
              <div key={i} className="h-[0.3rem] rounded-full bg-input" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="mt-auto flex flex-col items-center gap-2 rounded-xl border border-dashed border-primary/25 bg-card/85 px-3 py-4 text-center backdrop-blur-sm">
            <ImageIcon className="size-5 text-primary/70" aria-hidden="true" />
            <span className="font-mono text-[0.65rem] font-medium tracking-wide text-primary uppercase">Placeholder</span>
            <span className="text-xs leading-snug text-muted-foreground">Imagem oficial do modelo será adicionada</span>
          </div>
        </div>
      )}
    </div>
  )
}
