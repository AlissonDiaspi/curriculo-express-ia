
'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import type {
  EditorStepId,
  ResumeContent,
} from '@/types/resume'

import { EDITOR_STEPS, ROUTES } from '@/lib/constants'
import { api, ApiError } from '@/lib/api'
import { isStepValid } from '@/lib/resume-validation'

import {
  isPersonalValid,
  useResume,
} from '@/providers/resume-provider'

import { ActionButton } from '@/components/shared/action-button'
import { StepIndicator } from '@/components/resume-editor/step-indicator'
import { GuidancePanel } from '@/components/resume-editor/guidance-panel'
import { PersonalStep } from '@/components/resume-editor/steps/personal-step'
import { SummaryStep } from '@/components/resume-editor/steps/summary-step'
import { ExperiencesStep } from '@/components/resume-editor/steps/experiences-step'
import { EducationStep } from '@/components/resume-editor/steps/education-step'
import { SkillsStep } from '@/components/resume-editor/steps/skills-step'
import { ReviewStep } from '@/components/resume-editor/steps/review-step'

const RESUME_STORAGE_KEY =
  'curriculo-express:resume-id'

const PROGRESS_STORAGE_PREFIX =
  'curriculo-express:progress:'

type RestoreStatus =
  | 'loading'
  | 'ready'
  | 'error'

function prepareContent(
  resume: ResumeContent,
): ResumeContent {
  return {
    ...resume,

    experiences: resume.experiences.filter(
      (experience) =>
        experience.company.trim().length > 0 &&
        experience.role.trim().length > 0,
    ),

    education: resume.education.filter(
      (education) =>
        education.institution.trim().length > 0 &&
        education.course.trim().length > 0,
    ),
  }
}

function getStoredProgress(id: string): number {
  const raw = sessionStorage.getItem(
    `${PROGRESS_STORAGE_PREFIX}${id}`,
  )

  if (!raw) return 1

  const value = Number(raw)

  if (!Number.isInteger(value)) return 1

  return Math.max(
    1,
    Math.min(value, EDITOR_STEPS.length),
  )
}

export function ResumeEditor({
  initialStepId,
}: {
  initialStepId?: string
}) {
  const router = useRouter()

  const {
    resume,
    resumeId,
    setResumeId,
    completedSteps,
    setCompletedSteps,
    loadResume,
  } = useResume()

  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [showErrors, setShowErrors] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [restoreStatus, setRestoreStatus] =
    useState<RestoreStatus>('loading')

  const [restoreAttempt, setRestoreAttempt] =
    useState(0)

  const formRef = useRef<HTMLFormElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const savingRef = useRef(false)

  const step = EDITOR_STEPS[current]
  const isLast = current === EDITOR_STEPS.length - 1

  const selectInitialStep = useCallback(
    (progress: number) => {
      const requested = EDITOR_STEPS.findIndex(
        (item) => item.id === initialStepId,
      )

      const fallback = Math.min(
        progress,
        EDITOR_STEPS.length - 1,
      )

      return requested >= 0 && requested <= progress
        ? requested
        : fallback
    },
    [initialStepId],
  )

  // Recupera o currículo quando o editor é aberto.
  // Sem a trava antiga que causava problemas
  // com o React Strict Mode.
  useEffect(() => {
    let cancelled = false

    const restore = async () => {
      setRestoreStatus('loading')

      const storedId = sessionStorage.getItem(
        RESUME_STORAGE_KEY,
      )

      // Se já existe um currículo carregado no
      // contexto, não precisamos buscar novamente.
      if (resumeId) {
        if (!cancelled) {
          setCurrent(
            selectInitialStep(completedSteps),
          )

          setRestoreStatus('ready')
        }

        return
      }

      // Nenhum currículo salvo nesta aba.
      if (!storedId) {
        if (!cancelled) {
          setCurrent(
            selectInitialStep(completedSteps),
          )

          setRestoreStatus('ready')
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

        setCurrent(
          selectInitialStep(progress),
        )

        setRestoreStatus('ready')
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

          toast.error(
            'O rascunho anterior não está mais disponível nesta sessão.',
          )

          setCurrent(0)
          setRestoreStatus('ready')
          return
        }

        toast.error(
          'Não foi possível recuperar seu currículo.',
        )

        setRestoreStatus('error')
      }
    }

    void restore()

    return () => {
      cancelled = true
    }
  }, [
    resumeId,
    completedSteps,
    loadResume,
    selectInitialStep,
    restoreAttempt,
  ])

  const retryRestore = () => {
    setRestoreAttempt((current) => current + 1)
  }

  const goTo = (index: number) => {
    if (
      index === current ||
      index < 0 ||
      index >= EDITOR_STEPS.length ||
      index > completedSteps ||
      savingRef.current ||
      restoreStatus !== 'ready'
    ) {
      return
    }

    setDirection(index > current ? 1 : -1)
    setShowErrors(false)
    setCurrent(index)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    requestAnimationFrame(() => {
      headingRef.current?.focus({
        preventScroll: true,
      })
    })
  }

  const goToStepId = (id: EditorStepId) => {
    const index = EDITOR_STEPS.findIndex(
      (item) => item.id === id,
    )

    goTo(index)
  }

  const handleContinue = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (
      savingRef.current ||
      restoreStatus !== 'ready'
    ) {
      return
    }

    if (!isStepValid(step.id, resume)) {
      setShowErrors(true)

      toast.error(
        'Revise os campos destacados para continuar.',
      )

      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>(
            '[aria-invalid="true"]',
          )
          ?.focus()
      })

      return
    }

    if (!isPersonalValid(resume.personal)) {
      setShowErrors(true)

      toast.error(
        'Preencha nome e e-mail corretamente.',
      )

      return
    }

    savingRef.current = true
    setIsSaving(true)

    try {
      const content = prepareContent(resume)

      const title =
        `Currículo de ${resume.personal.fullName.trim()}`

      let savedId = resumeId

      if (!savedId) {
        // Criação inicial do currículo.
        await api.createSession()

        const created = await api.createResume({
          title,
          templateId: null,
          content,
        })

        savedId = created.id
        setResumeId(created.id)

        sessionStorage.setItem(
          RESUME_STORAGE_KEY,
          created.id,
        )

        toast.success(
          'Currículo criado com sucesso!',
        )
      } else {
        // Atualiza o currículo existente.
        await api.updateResume(savedId, {
          title,
          content,
        })

        toast.success(
          'Alterações salvas com sucesso!',
        )
      }

      const nextProgress = Math.max(
        completedSteps,
        current + 1,
      )

      setCompletedSteps(nextProgress)

      sessionStorage.setItem(
        `${PROGRESS_STORAGE_PREFIX}${savedId}`,
        String(nextProgress),
      )

      if (isLast) {
        router.push(ROUTES.templates)
        return
      }

      setDirection(1)
      setShowErrors(false)
      setCurrent(current + 1)

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } catch (error) {
      console.error(
        'Erro ao salvar currículo:',
        error,
      )

      toast.error(
        'Não foi possível salvar as alterações. Tente novamente.',
      )
    } finally {
      savingRef.current = false
      setIsSaving(false)
    }
  }

  if (restoreStatus === 'loading') {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center gap-4 px-4">
        <RefreshCw
          className="h-6 w-6 animate-spin text-primary"
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

  if (restoreStatus === 'error') {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            Não foi possível carregar seu currículo
          </h2>

          <p className="max-w-md text-sm text-muted-foreground">
            Tivemos um problema ao consultar o servidor.
            Seus dados salvos não foram apagados.
          </p>
        </div>

        <ActionButton
          onClick={retryRestore}
        >
          <RefreshCw aria-hidden="true" />
          Tentar novamente
        </ActionButton>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 md:py-10 lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:gap-8">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <StepIndicator
          steps={EDITOR_STEPS}
          current={current}
          maxReachable={completedSteps}
          onSelect={goTo}
        />
      </aside>

      <form
        ref={formRef}
        onSubmit={handleContinue}
        noValidate
        className="flex min-w-0 flex-col gap-6 rounded-3xl border border-border bg-card p-5 shadow-[0_1px_2px_oklch(0.22_0.045_265/0.04),0_24px_48px_-32px_oklch(0.22_0.045_265/0.18)] md:p-8"
      >
        <AnimatePresence
          mode="wait"
          custom={direction}
          initial={false}
        >
          <motion.div
            key={step.id}
            custom={direction}
            variants={{
              enter: (d: number) => ({
                opacity: 0,
                x: d * 24,
              }),
              center: {
                opacity: 1,
                x: 0,
              },
              exit: (d: number) => ({
                opacity: 0,
                x: d * -24,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex flex-col gap-6"
          >
            <header className="flex flex-col gap-1.5">
              <p className="font-mono text-xs font-medium tracking-wider text-primary uppercase">
                Etapa {current + 1} de{' '}
                {EDITOR_STEPS.length}
              </p>

              <h1
                ref={headingRef}
                tabIndex={-1}
                className="text-2xl font-semibold tracking-tight text-balance outline-none md:text-3xl"
              >
                {step.title}
              </h1>

              <p className="leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </header>

            {step.id === 'personal' && (
              <PersonalStep showErrors={showErrors} />
            )}

            {step.id === 'summary' && (
              <SummaryStep showErrors={showErrors} />
            )}

            {step.id === 'experiences' && (
              <ExperiencesStep showErrors={showErrors} />
            )}

            {step.id === 'education' && (
              <EducationStep showErrors={showErrors} />
            )}

            {step.id === 'skills' && (
              <SkillsStep />
            )}

            {step.id === 'review' && (
              <ReviewStep onEdit={goToStepId} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="sticky bottom-0 -mx-5 -mb-5 flex items-center justify-between gap-3 rounded-b-3xl border-t border-border bg-card/95 px-5 py-4 backdrop-blur md:static md:mx-0 md:mb-0 md:rounded-none md:bg-transparent md:px-0 md:pt-6 md:pb-0">
          <ActionButton
            variant="ghost"
            onClick={() =>
              current === 0
                ? router.push(ROUTES.home)
                : goTo(current - 1)
            }
            disabled={isSaving}
          >
            <ArrowLeft aria-hidden="true" />
            Voltar
          </ActionButton>

          <ActionButton
            type="submit"
            className="min-w-36"
            disabled={isSaving}
          >
            {isSaving
              ? 'Salvando...'
              : isLast
                ? 'Escolher modelo'
                : 'Continuar'}

            {!isSaving && (
              <ArrowRight
                className="transition-transform group-hover/action:translate-x-0.5"
                aria-hidden="true"
              />
            )}
          </ActionButton>
        </div>
      </form>

      <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
        <GuidancePanel step={step.id} />
      </aside>
    </div>
  )
}
