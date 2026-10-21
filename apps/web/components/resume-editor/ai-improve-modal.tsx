
'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Check,
  Loader2,
  Sparkles,
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

  const [sourceText, setSourceText] = useState('')
  const [message, setMessage] = useState('')

  // Identifica requisições antigas para evitar
  // que atualizem o modal depois de fechado.
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
      setSourceText('')
      setMessage('')
      setUsage(null)
      return
    }

    const currentRequest = ++requestId.current

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
        'Você já utilizou a melhoria com IA nesta categoria.',
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
          'A IA não retornou uma sugestão válida.',
        )
        return
      }

      setSuggestion(response.improvedText)

      // O backend já registrou a utilização.
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
    } catch (error) {
      if (requestId.current !== currentRequest) {
        return
      }

      if (error instanceof ApiError && error.status === 409) {
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

        setMessage(
          'Esta melhoria já foi utilizada ou está sendo processada.',
        )
      } else {
        setMessage(
          'Não foi possível acessar a IA. Seu texto original foi preservado.',
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
            <Sparkles
              className="size-5"
              aria-hidden="true"
            />
          </span>

          <DialogTitle className="text-lg font-semibold">
            {title}
          </DialogTitle>

          <DialogDescription>
            A IA sugere uma redação mais profissional,
            sem inventar informações. Você decide se
            deseja utilizar a sugestão.
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
          ) : suggestion !== null || isUsed ? (
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
          <div className="space-y-2">
            <label
              htmlFor="ai-suggestion"
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <Check className="size-4 text-success" />
              Sugestão da IA — você pode editar
            </label>

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
              Confira os números e as informações antes
              de aplicar a sugestão.
            </p>
          </div>
        )}

        {!checkingUsage &&
          isUsed &&
          suggestion === null &&
          !message && (
            <div className="flex gap-2 rounded-xl border border-border bg-surface/60 p-3 text-sm text-muted-foreground">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              A melhoria desta categoria já foi utilizada.
              Você pode continuar editando normalmente.
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
                  suggestion.length > maxLength
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
                <Sparkles className="size-4" />
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
