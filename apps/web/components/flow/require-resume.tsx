
'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  FilePen,
  LayoutTemplate,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'

import { EmptyState } from '@/components/shared/states'
import { PrimaryButton } from '@/components/shared/action-button'

import {
  isPersonalValid,
  useResume,
} from '@/providers/resume-provider'

import { api, ApiError } from '@/lib/api'
import { ROUTES } from '@/lib/constants'

const RESUME_STORAGE_KEY =
  'curriculo-express:resume-id'

const PROGRESS_STORAGE_PREFIX =
  'curriculo-express:progress:'

type RestoreStatus =
  | 'loading'
  | 'ready'
  | 'error'

function getStoredProgress(id: string): number {
  const raw = sessionStorage.getItem(
    `${PROGRESS_STORAGE_PREFIX}${id}`,
  )

  if (!raw) return 1

  const value = Number(raw)

  if (!Number.isInteger(value)) return 1

  return Math.max(1, Math.min(value, 6))
}

export function RequireResume({
  requireTemplate = false,
  children,
}: {
  requireTemplate?: boolean
  children: React.ReactNode
}) {
  const {
    resume,
    resumeId,
    templateId,
    loadResume,
  } = useResume()

  const [status, setStatus] =
    useState<RestoreStatus>('loading')

  const [retryCount, setRetryCount] =
    useState(0)

  useEffect(() => {
    let cancelled = false

    const restore = async () => {
      setStatus('loading')

      // O currículo já está carregado na memória.
      if (resumeId && isPersonalValid(resume.personal)) {
        if (!cancelled) {
          setStatus('ready')
        }

        return
      }

      const storedId = sessionStorage.getItem(
        RESUME_STORAGE_KEY,
      )

      // Não existe currículo salvo nesta aba.
      if (!storedId) {
        if (!cancelled) {
          setStatus('ready')
        }

        return
      }

      try {
        const savedResume =
          await api.getResume(storedId)

        if (cancelled) return

        const progress =
          getStoredProgress(storedId)

        loadResume(
          savedResume.id,
          savedResume.content,
          savedResume.templateId,
          progress,
        )

        setStatus('ready')
      } catch (error) {
        if (cancelled) return

        console.error(
          'Erro ao recuperar currículo:',
          error,
        )

        if (
          error instanceof ApiError &&
          (error.status === 401 ||
            error.status === 404)
        ) {
          sessionStorage.removeItem(
            RESUME_STORAGE_KEY,
          )

          sessionStorage.removeItem(
            `${PROGRESS_STORAGE_PREFIX}${storedId}`,
          )

          setStatus('ready')
          return
        }

        setStatus('error')
      }
    }

    void restore()

    return () => {
      cancelled = true
    }

    // Executa novamente apenas quando o usuário
    // solicita uma nova tentativa.
    // O loadResume atualiza o contexto durante a restauração.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount])

  if (status === 'loading') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <LoaderCircle
          className="size-7 animate-spin text-primary"
          aria-hidden="true"
        />

        <p
          role="status"
          className="text-sm text-muted-foreground"
        >
          Recuperando seu currículo...
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            Não foi possível carregar seu currículo
          </h2>

          <p className="text-sm text-muted-foreground">
            Houve um problema ao consultar o servidor.
            Seus dados salvos não foram apagados.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setRetryCount((value) => value + 1)
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <RefreshCw
            className="size-4"
            aria-hidden="true"
          />
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!isPersonalValid(resume.personal)) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <EmptyState
          icon={FilePen}
          title="Comece pelas suas informações"
          description="Ainda não encontramos os dados do seu currículo nesta sessão. Preencha as informações para continuar."
          action={
            <PrimaryButton href={ROUTES.editor}>
              Preencher informações
            </PrimaryButton>
          }
        />
      </div>
    )
  }

  if (requireTemplate && !templateId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <EmptyState
          icon={LayoutTemplate}
          title="Escolha um modelo primeiro"
          description="Selecione a apresentação do seu currículo para seguir para esta etapa."
          action={
            <PrimaryButton href={ROUTES.templates}>
              Escolher modelo
            </PrimaryButton>
          }
        />
      </div>
    )
  }

  return <>{children}</>
}
