
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  FileText,
  LoaderCircle,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
} from 'lucide-react'

import type { ResumeTemplate } from '@/types/template'
import { useResume } from '@/providers/resume-provider'
import { api } from '@/lib/api'

const ZOOM_LEVELS = [0.75, 0.9, 1, 1.15, 1.3]

type PreviewState = 'idle' | 'loading' | 'ready' | 'error'

interface PreviewPage {
  pageNumber: number
  imageUrl: string
  width: number
  height: number
}

export function ResumePreviewPane({
  template,
}: {
  template: ResumeTemplate | undefined
}) {
  const { resumeId, templateId } = useResume()

  const [zoomIndex, setZoomIndex] = useState(2)
  const [status, setStatus] = useState<PreviewState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [pages, setPages] = useState<PreviewPage[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const generationRef = useRef(0)

  const zoom = ZOOM_LEVELS[zoomIndex]

  const refreshPreview = useCallback(() => {
    setRefreshKey((value) => value + 1)
  }, [])

  useEffect(() => {
    if (!resumeId || !templateId) {
      setStatus('idle')
      setPages([])
      return
    }

    let cancelled = false
    const generation = ++generationRef.current
    const generatedUrls: string[] = []

    async function loadPreview() {
      setStatus('loading')
      setErrorMessage('')
      setPages([])

      try {
        // Busca somente o PDF com marca d'água.
        const pdfBlob = await api.getResumePreview(resumeId!)

        if (cancelled) return

        const pdfData = new Uint8Array(
          await pdfBlob.arrayBuffer(),
        )

        // Importação dinâmica para executar PDF.js
        // somente no navegador.
        const pdfjs = await import('pdfjs-dist')

        pdfjs.GlobalWorkerOptions.workerSrc =
          new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url,
          ).toString()

        const loadingTask = pdfjs.getDocument({
          data: pdfData,
        })

        const pdfDocument = await loadingTask.promise

        const renderedPages: PreviewPage[] = []

        for (
          let pageNumber = 1;
          pageNumber <= pdfDocument.numPages;
          pageNumber++
        ) {
          if (cancelled) break

          const page = await pdfDocument.getPage(pageNumber)

          // Resolução usada para gerar a imagem.
          const viewport = page.getViewport({
            scale: 1.5,
          })

          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')

          if (!context) {
            throw new Error(
              'Não foi possível inicializar o renderizador.',
            )
          }

          canvas.width = Math.ceil(viewport.width)
          canvas.height = Math.ceil(viewport.height)

          await page.render({
            canvas,
            canvasContext: context,
            viewport,
          }).promise

          const imageBlob = await new Promise<Blob>(
            (resolve, reject) => {
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    resolve(blob)
                  } else {
                    reject(
                      new Error(
                        'Não foi possível gerar a imagem da página.',
                      ),
                    )
                  }
                },
                'image/png',
              )
            },
          )

          const imageUrl = URL.createObjectURL(imageBlob)
          generatedUrls.push(imageUrl)

          renderedPages.push({
            pageNumber,
            imageUrl,
            width: canvas.width,
            height: canvas.height,
          })

          page.cleanup()
        }

        await loadingTask.destroy()

        if (
          cancelled ||
          generation !== generationRef.current
        ) {
          return
        }

        setPages(renderedPages)
        setStatus('ready')
      } catch (error) {
        if (cancelled) return

        console.error('Erro ao carregar prévia:', error)

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar o currículo.',
        )

        setStatus('error')
      }
    }

    void loadPreview()

    return () => {
      cancelled = true
      generationRef.current++

      for (const url of generatedUrls) {
        URL.revokeObjectURL(url)
      }
    }
  }, [resumeId, templateId, refreshKey])

  return (
    <section
      aria-labelledby="preview-title"
      className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card"
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <h2
            id="preview-title"
            className="text-sm font-medium text-foreground"
          >
            Pré-visualização
          </h2>

          <span className="text-xs text-muted-foreground">
            {template?.name ?? 'Currículo'}
          </span>
        </div>

        <div
          className="flex items-center gap-1 rounded-full border border-border bg-background p-1"
          role="group"
          aria-label="Zoom da prévia"
        >
          <button
            type="button"
            onClick={() =>
              setZoomIndex((i) => Math.max(0, i - 1))
            }
            disabled={zoomIndex === 0}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
            aria-label="Diminuir zoom"
          >
            <Minus className="size-3.5" />
          </button>

          <span
            className="w-11 text-center font-mono text-xs tabular-nums text-foreground"
            aria-live="polite"
          >
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={() =>
              setZoomIndex((i) =>
                Math.min(ZOOM_LEVELS.length - 1, i + 1),
              )
            }
            disabled={
              zoomIndex === ZOOM_LEVELS.length - 1
            }
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
            aria-label="Aumentar zoom"
          >
            <Plus className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setZoomIndex(2)}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Redefinir zoom"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Área da prévia */}
      <div className="flex min-h-[520px] flex-col items-center overflow-auto bg-surface/60 p-4 md:p-8">
        {status === 'loading' && (
          <div
            className="flex min-h-[440px] flex-col items-center justify-center gap-4"
            role="status"
          >
            <LoaderCircle className="size-9 animate-spin text-primary" />

            <div className="text-center">
              <p className="font-medium text-foreground">
                Preparando seu currículo...
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Aplicando o modelo e gerando a prévia.
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div
            className="flex min-h-[440px] max-w-sm flex-col items-center justify-center gap-4 text-center"
            role="alert"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </span>

            <div>
              <p className="font-semibold text-foreground">
                Não foi possível carregar a prévia
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {errorMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={refreshPreview}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <RefreshCw className="size-4" />
              Tentar novamente
            </button>
          </div>
        )}

        {status === 'idle' && (
          <div className="flex min-h-[440px] flex-col items-center justify-center gap-3 text-center">
            <FileText className="size-10 text-muted-foreground" />

            <p className="text-sm text-muted-foreground">
              Selecione um modelo para visualizar seu currículo.
            </p>
          </div>
        )}

        {status === 'ready' && (
          <div
            className="flex w-full flex-col items-center gap-5"
            aria-label="Páginas do currículo"
          >
            {pages.map((page) => (
              <div
                key={page.pageNumber}
                className="w-full"
                style={{
                  width: `${zoom * 100}%`,
                }}
              >
                <div className="overflow-hidden rounded-sm border border-border bg-white shadow-[0_20px_45px_-25px_rgba(0,0,0,0.35)]">
                  {/* Imagem gerada a partir do PDF marcado */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={page.imageUrl}
                    alt={`Página ${page.pageNumber} da prévia do currículo`}
                    width={page.width}
                    height={page.height}
                    className="block h-auto w-full"
                    draggable={false}
                  />
                </div>

                <p className="mt-2 text-center font-mono text-[11px] text-muted-foreground">
                  Página {page.pageNumber} de {pages.length}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <span className="text-xs text-muted-foreground">
          Prévia protegida com marca d&apos;água
        </span>

        <button
          type="button"
          onClick={refreshPreview}
          disabled={status === 'loading' || !resumeId}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-opacity hover:opacity-70 disabled:opacity-40"
        >
          <RefreshCw className="size-3.5" />
          Atualizar
        </button>
      </div>
    </section>
  )
}
