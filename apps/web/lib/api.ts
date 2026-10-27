
import { API_BASE_URL } from '@/lib/constants'
import type { ResumeContent } from '@/types/resume'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(
      'NEXT_PUBLIC_API_URL não configurada.',
      0,
    )
  }

  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  } catch {
    throw new ApiError(
      'Não foi possível conectar ao servidor.',
      0,
    )
  }

  if (!response.ok) {
    throw new ApiError(
      `Erro ${response.status} ao acessar ${path}`,
      response.status,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

/**
 * Busca um documento PDF protegido pela sessão.
 * Utilizado para exibir a prévia do currículo.
 */
async function apiFetchBlob(
  path: string,
): Promise<Blob> {
  if (!API_BASE_URL) {
    throw new ApiError(
      'NEXT_PUBLIC_API_URL não configurada.',
      0,
    )
  }

  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        Accept: 'application/pdf',
      },
    })
  } catch {
    throw new ApiError(
      'Não foi possível conectar ao servidor.',
      0,
    )
  }

  if (!response.ok) {
    throw new ApiError(
      `Não foi possível carregar a prévia (${response.status}).`,
      response.status,
    )
  }

  const contentType = response.headers.get('content-type')

  if (!contentType?.includes('application/pdf')) {
    throw new ApiError(
      'O servidor não retornou um PDF válido.',
      response.status,
    )
  }

  return response.blob()
}

export type ResumeDownloadFormat = 'pdf' | 'docx'

/**
 * Baixa o currículo em PDF ou Word.
 *
 * O cookie da sessão é enviado automaticamente.
 * O backend valida se o currículo pertence
 * à sessão atual antes de gerar o arquivo.
 */
async function downloadResumeFile(
  resumeId: string,
  format: ResumeDownloadFormat,
): Promise<void> {
  if (!API_BASE_URL) {
    throw new ApiError(
      'NEXT_PUBLIC_API_URL não configurada.',
      0,
    )
  }

  const path =
    `/resumes/${encodeURIComponent(resumeId)}/download/${format}`

  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        Accept:
          format === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
    })
  } catch {
    throw new ApiError(
      'Não foi possível conectar ao servidor para baixar o currículo.',
      0,
    )
  }

  if (!response.ok) {
    throw new ApiError(
      `Não foi possível baixar o currículo (${response.status}).`,
      response.status,
    )
  }

  const expectedContentType =
    format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

  const contentType =
    response.headers.get('content-type')

  if (!contentType?.includes(expectedContentType)) {
    throw new ApiError(
      'O servidor retornou um formato de arquivo inesperado.',
      response.status,
    )
  }

  const blob = await response.blob()

  if (blob.size === 0) {
    throw new ApiError(
      'O arquivo gerado está vazio.',
      response.status,
    )
  }

  const url = URL.createObjectURL(blob)

  try {
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = `curriculo.${format}`
    anchor.style.display = 'none'

    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  } finally {
    window.setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)
  }
}

export interface SessionResponse {
  expiresAt: string
}

export interface ResumeRecord {
  id: string
  title: string
  status: 'DRAFT' | 'READY' | 'ARCHIVED'
  templateId: string | null
  content: ResumeContent
  createdAt: string
  updatedAt: string
}

export type AiImprovementType =
  | 'summary'
  | 'experience'

/**
 * Identifica a origem da melhoria.
 */
export type AiImprovementSource =
  | 'gemini'
  | 'local'

/**
 * Resposta da API ao solicitar uma melhoria.
 */
export type AiImprovementResponse =
  | {
      status: 'improved'
      originalText: string
      improvedText: string
      type: AiImprovementType
      source: AiImprovementSource
      remaining: number
      message?: string
    }
  | {
      status: 'unavailable'
      originalText: string
      improvedText: null
      type: AiImprovementType
      message: string
    }

/**
 * Estado das utilizações de IA do currículo.
 */
export interface AiUsageResponse {
  summary: {
    used: boolean
    available: boolean
  }
  experience: {
    used: boolean
    available: boolean
  }
}

export const api = {
  /**
   * Cria uma sessão anônima.
   */
  createSession: () =>
    apiFetch<SessionResponse>('/sessions', {
      method: 'POST',
    }),

  /**
   * Cria um currículo.
   */
  createResume: (body: {
    title: string
    templateId: string | null
    content: ResumeContent
  }) =>
    apiFetch<ResumeRecord>('/resumes', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /**
   * Busca um currículo da sessão atual.
   */
  getResume: (id: string) =>
    apiFetch<ResumeRecord>(
      `/resumes/${encodeURIComponent(id)}`,
    ),

  /**
   * Atualiza os dados de um currículo.
   */
  updateResume: (
    id: string,
    body: Partial<{
      title: string
      templateId: string | null
      content: ResumeContent
    }>,
  ) =>
    apiFetch<ResumeRecord>(
      `/resumes/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
    ),

  /**
   * Busca a prévia em PDF.
   */
  getResumePreview: (id: string) =>
    apiFetchBlob(
      `/resumes/${encodeURIComponent(id)}/preview`,
    ),

  /**
   * Baixa  o currículo
   * em PDF ou Word .
   */
  downloadResume: (
    resumeId: string,
    format: ResumeDownloadFormat,
  ) => downloadResumeFile(resumeId, format),

  /**
   * Solicita uma melhoria de texto.
   */
  improveText: (
    resumeId: string,
    text: string,
    type: AiImprovementType,
  ) =>
    apiFetch<AiImprovementResponse>('/ai/improve', {
      method: 'POST',
      cache: 'no-store',
      body: JSON.stringify({
        resumeId,
        text,
        type,
      }),
    }),

  /**
   * Consulta o consumo da IA no PostgreSQL.
   */
  getAiUsage: (resumeId: string) =>
    apiFetch<AiUsageResponse>(
      `/ai/usage/${encodeURIComponent(resumeId)}`,
      {
        cache: 'no-store',
      },
    ),
}
