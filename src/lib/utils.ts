import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Desembrulha a resposta paginada do DRF (`{count, next, previous, results}`)
 * ou devolve a lista quando o endpoint responde array puro.
 * Contrato: `DEFAULT_PAGINATION_CLASS` / `PAGE_SIZE=100` em nfs/settings.py.
 */
export function unwrapPaginated<T = unknown>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === "object") {
    const results = (data as { results?: unknown; data?: unknown }).results
    if (Array.isArray(results)) return results as T[]
    const rows = (data as { data?: unknown }).data
    if (Array.isArray(rows)) return rows as T[]
  }
  return []
}

/** Baixa um Blob como arquivo, sem criar âncoras permanentes no DOM. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}
