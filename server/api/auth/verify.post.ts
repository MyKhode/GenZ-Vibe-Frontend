import { defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig(event)
  const base = (config.public as any)?.apiBase as string | undefined

  if (!base) {
    event.node.res.statusCode = 500
    return { error: true, message: 'NUXT_PUBLIC_API_BASE_URL is not configured on frontend' }
  }

  const target = base.replace(/\/$/, '') + '/auth/verify'
  const res = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => null)
  event.node.res.statusCode = res.status
  if (!res.ok) {
    return { error: true, status: res.status, message: data?.message || 'Proxy error', data }
  }
  return data
})
