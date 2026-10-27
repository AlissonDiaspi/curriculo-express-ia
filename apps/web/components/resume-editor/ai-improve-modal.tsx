
'use client'

import { useEffect, useRef, useState } from 'react'

import {
  AlertCircle,
  Check,
  FilePenLine,
  Loader2,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { ActionButton } from '@/components/shared/action-button'

import {
  api,
  ApiError,
  type AiImprovementType,
  type AiUsageResponse,
} from '@/lib/api'

import { useResume } from '@/providers/resume-provider'

type ImprovementSource = 'gemini' | 'local'

interface AiImproveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  text: string
  type: AiImprovementType
  onApply: (text: string) => void
  maxLength?: number
}

export function AiImproveModal({
  open,
  onOpenChange,
  text,
  type,
  onApply,
  maxLength,
}: AiImproveModalProps) {
  const { resumeId } = useResume()

  const [loading, setLoading] = useState(false)
  const [checkingUsage, setCheckingUsage] = useState(false)

  const [usage, setUsage] =
    useState<AiUsageResponse | null>(null)

  const [suggestion, setSuggestion] =
    useState<string | null>(null)

  const [source, setSource] =
    useState<ImprovementSource | null>(null)

  const [sourceText, setSourceText] = useState('')
  const [message, setMessage] = useState('')

  const requestId = useRef(0)

  const category = usage?.[type]
  const isUsed = category?.used ?? false
  const available = category?.available ?? false

  const title =
    type === 'summary'
      ? 'Melhorar resumo com IA'
      : 'Melhorar experiência com IA'

  useEffect(() => {
    if (!open) {
      requestId.current += 1

      setLoading(false)
      setCheckingUsage(false)
      setSuggestion(null)
      setSource(null)
      setSourceText('')
      setMessage('')
      setUsage(null)

      return
    }

    const currentRequest = ++requestId.current

    setSuggestion(null)
    setSource(null)
    setSourceText('')
    setUsage(null)

    if (!resumeId) {
      setMessage(
        'Salve o currículo antes de utilizar a IA.',
      )
      return
    }

    setCheckingUsage(true)
    setMessage('')

    void api
      .getAiUsage(resumeId)
      .then((result) => {
        if (requestId.current !== currentRequest) {
          return
        }

        setUsage(result)
      })
      .catch(() => {
        if (requestId.current !== currentRequest) {
          return
        }

        setMessage(
          'Não foi possível consultar suas utilizações. Tente abrir novamente.',
        )
      })
      .finally(() => {
        if (requestId.current === currentRequest) {
          setCheckingUsage(false)
        }
      })
  }, [open, resumeId])

  const generate = async () => {
    const original = text.trim()

    if (!resumeId) {
      setMessage(
        'Salve o currículo antes de utilizar a IA.',
      )
      return
    }

    if (loading || checkingUsage) {
      return
    }

    if (!usage || !available) {
      setMessage(
        'A utilização de IA não está disponível para esta categoria.',
      )
      return
    }

    if (!original) {
      setMessage(
        'Escreva um texto antes de solicitar uma melhoria.',
      )
      return
    }

    if (original.length > 4000) {
      setMessage(
        'O texto deve ter no máximo 4000 caracteres.',
      )
      return
    }

    const currentRequest = ++requestId.current

    setLoading(true)
    setMessage('')
    setSuggestion(null)
    setSource(null)
    setSourceText(original)

    try {
      const response = await api.improveText(
        resumeId,
        original,
        type,
      )

      if (requestId.current !== currentRequest) {
        return
      }

      if (response.status === 'unavailable') {
        setMessage(response.message)
        return
      }

      if (!response.improvedText.trim()) {
        setMessage(
          'O serviço não retornou uma sugestão válida.',
        )
        return
      }

      // Aceita o campo source enviado pelo backend.
      // Também funciona enquanto o tipo de api.ts
      // ainda não tiver sido atualizado.
      const responseSource =
        'source' in response
          ? response.source
          : undefined

      const improvementSource: ImprovementSource | null =
        responseSource === 'gemini' ||
        responseSource === 'local'
          ? responseSource
          : null

      setSuggestion(response.improvedText)
      setSource(improvementSource)

      // Apenas o Gemini consome a utilização.
      // Se a origem for desconhecida, buscamos
      // novamente o estado real no backend.
      if (improvementSource === 'gemini') {
        setUsage((previous) => {
          if (!previous) return previous

          return {
            ...previous,
            [type]: {
              used: true,
              available: false,
            },
          }
        })
      } else if (improvementSource === 'local') {
        setUsage((previous) => {
          if (!previous) return previous

          return {
            ...previous,
            [type]: {
              used: false,
              available: true,
            },
          }
        })
      } else {
        try {
          const updatedUsage =
            await api.getAiUsage(resumeId)

          if (requestId.current === currentRequest) {
            setUsage(updatedUsage)
          }
        } catch {
          if (requestId.current === currentRequest) {
            setMessage(
              'Sugestão gerada. Não foi possível atualizar o contador de utilização.',
            )
          }
        }
      }
    } catch (error) {
      if (requestId.current !== currentRequest) {
        return
      }

      if (error instanceof ApiError && error.status === 409) {
        setMessage(
          'Esta melhoria já foi utilizada ou está sendo processada.',
        )

        // Um conflito também pode representar uma
        // reserva temporária. Consultamos o backend
        // em vez de marcar o uso como consumido.
        try {
          const updatedUsage =
            await api.getAiUsage(resumeId)

          if (requestId.current === currentRequest) {
            setUsage(updatedUsage)
          }
        } catch {
          // Mantém a mensagem de conflito.
        }
      } else {
        setMessage(
          'Não foi possível acessar o serviço. Seu texto original foi preservado.',
        )
      }
    } finally {
      if (requestId.current === currentRequest) {
        setLoading(false)
      }
    }
  }

  const apply = () => {
    const improved = suggestion?.trim()

    if (!improved) {
      return
    }

    if (maxLength && improved.length > maxLength) {
      setMessage(
        `A sugestão deve ter no máximo ${maxLength} caracteres.`,
      )
      return
    }

    onApply(improved)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] gap-5 overflow-y-auto rounded-2xl p-6 sm:max-w-xl">
        <DialogHeader className="gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground">
            <FilePenLine
              className="size-5"
              aria-hidden="true"
            />
          </span>

          <DialogTitle className="text-lg font-semibold">
            {title}
          </DialogTitle>

          <DialogDescription>
            Receba sugestões de redação mais profissional,
            sem inventar informações. Você decide se deseja
            utilizar o resultado.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-xl border border-border bg-surface/60 p-3">
          <span className="text-sm font-medium text-foreground">
            Utilização de IA
          </span>

          {checkingUsage ? (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Verificando...
            </span>
          ) : isUsed ? (
            <span className="text-xs font-medium text-muted-foreground">
              0 de 1 disponível
            </span>
          ) : available ? (
            <span className="text-xs font-medium text-success">
              1 de 1 disponível
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Indisponível
            </span>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Texto original
          </p>

          <div className="whitespace-pre-wrap rounded-xl border border-border bg-surface/60 p-4 text-sm leading-relaxed text-foreground">
            {sourceText || text || 'Nenhum texto informado.'}
          </div>
        </div>

        {suggestion !== null && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Check
                className="size-4 text-success"
                aria-hidden="true"
              />

              <label
                htmlFor="ai-suggestion"
                className="text-sm font-medium text-foreground"
              >
                Sugestão — você pode editar
              </label>
            </div>

            {source === 'gemini' && (
              <p
                role="status"
                className="rounded-xl border border-border bg-surface/60 p-3 text-sm text-foreground"
              >
                <span className="font-medium">
                  Melhorado com Gemini.
                </span>{' '}
                A utilização de IA desta categoria foi consumida.
              </p>
            )}

            {source === 'local' && (
              <p
                role="status"
                className="rounded-xl border border-border bg-surface/60 p-3 text-sm text-foreground"
              >
                <span className="font-medium">
                  Formatação local.
                </span>{' '}
                O Gemini está indisponível. Aplicamos correções
                básicas de formatação, sem consumir sua
                utilização de IA.
              </p>
            )}

            <textarea
              id="ai-suggestion"
              value={suggestion}
              onChange={(event) => {
                setSuggestion(event.target.value)
                setMessage('')
              }}
              rows={6}
              className="w-full rounded-xl border border-input bg-background p-4 text-sm leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />

            {maxLength && (
              <p className="text-xs text-muted-foreground">
                {suggestion.length}/{maxLength} caracteres
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Confira os números e as informações antes de
              aplicar a sugestão.
            </p>
          </div>
        )}

        {!checkingUsage &&
          isUsed &&
          suggestion === null &&
          !message && (
            <div className="flex gap-2 rounded-xl border border-border bg-surface/60 p-3 text-sm text-muted-foreground">
              <AlertCircle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>
                A melhoria desta categoria já foi utilizada.
                Você pode continuar editando normalmente.
              </span>
            </div>
          )}

        {message && (
          <p
            role="status"
            className="rounded-xl border border-border bg-surface/60 p-3 text-sm text-muted-foreground"
          >
            {message}
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <ActionButton
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Manter original
          </ActionButton>

          {suggestion !== null ? (
            <ActionButton
              type="button"
              onClick={apply}
              disabled={
                !suggestion.trim() ||
                Boolean(
                  maxLength &&
                    suggestion.length > maxLength,
                )
              }
            >
              <Check className="size-4" />
              Usar sugestão
            </ActionButton>
          ) : (
            <ActionButton
              type="button"
              onClick={() => void generate()}
              disabled={
                loading ||
                checkingUsage ||
                !resumeId ||
                !available ||
                !text.trim()
              }
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FilePenLine className="size-4" />
              )}

              {loading
                ? 'Melhorando...'
                : 'Gerar sugestão'}
            </ActionButton>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
