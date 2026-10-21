
import { z } from 'zod';

export const improvementTypeSchema = z.enum([
  'summary',
  'experience',
]);

export const improveTextSchema = z.object({
  resumeId: z.uuid(),

  text: z
    .string()
    .trim()
    .min(1, 'Informe um texto para melhorar.')
    .max(4000, 'O texto deve ter no máximo 4000 caracteres.'),

  type: improvementTypeSchema,
});

export type ImprovementType = z.infer<
  typeof improvementTypeSchema
>;

export type ImproveTextDto = z.infer<
  typeof improveTextSchema
>;

