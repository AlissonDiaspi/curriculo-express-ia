
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

export const api = {
  createSession: () =>
    apiFetch<SessionResponse>('/sessions', {
      method: 'POST',
    }),

  createResume: (body: {
    title: string
    templateId: string | null
    content: ResumeContent
  }) =>
    apiFetch<ResumeRecord>('/resumes', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getResume: (id: string) =>
    apiFetch<ResumeRecord>(`/resumes/${id}`),

  updateResume: (
    id: string,
    body: Partial<{
      title: string
      templateId: string | null
      content: ResumeContent
    }>,
  ) =>
    apiFetch<ResumeRecord>(`/resumes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // Busca a prévia do currículo com marca d'água.
  // Não retorna o documento final sem proteção.
  getResumePreview: (id: string) =>
    apiFetchBlob(
      `/resumes/${encodeURIComponent(id)}/preview`,
    ),
}
