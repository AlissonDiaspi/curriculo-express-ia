export type TemplateCategory = 'classico' | 'moderno' | 'minimalista' | 'criativo' | 'outro'

export interface ResumeTemplate {
  id: string
  name: string
  /** Thumbnail image path (e.g. /templates/modelo-01-thumb.png). `null` renders a labeled placeholder. */
  thumbnailUrl: string | null
  /** Large preview image path. `null` renders a labeled placeholder. */
  previewUrl: string | null
  description: string
  category: TemplateCategory
}
