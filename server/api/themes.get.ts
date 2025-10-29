import { defineEventHandler, getQuery } from 'h3'
import { useRuntimeConfig } from '#imports'

export interface ThemeItem {
  id: string
  title: string
  description?: string
  category?: string
  thumbnail?: string
  file?: string
  downloads?: number
}

export default defineEventHandler(async (event) => {
  const { limit, skip } = getQuery(event) as { limit?: string; skip?: string }
  const config = useRuntimeConfig()
  const base = (config.public as any)?.apiBase as string | undefined

  if (!base) return { items: [] as ThemeItem[] }
  const url = new URL('/themes/', base.replace(/\/$/, ''))
  if (limit) url.searchParams.set('limit', String(limit))
  if (skip) url.searchParams.set('skip', String(skip))
  try {
    const res = await $fetch<any>(url.toString(), { method: 'GET' })
    const items: ThemeItem[] = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : []
    return { items }
  } catch (e) {
    return { items: [] as ThemeItem[] }
  }
})

