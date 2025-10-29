import { defineEventHandler, getRouterParams } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const n = Number(id)
  if (!Number.isFinite(n)) return null
  const config = useRuntimeConfig()
  const base = (config.public as any)?.apiBase as string | undefined

  if (!base) return null
  const url = new URL(`/products/${encodeURIComponent(n)}`, base.replace(/\/$/, ''))
  const raw = await $fetch<any>(url.toString(), { method: 'GET' })
  if (!raw) return null
  // Map backend fields to frontend shape used elsewhere
  return {
    id: raw.id,
    name: raw.name,
    nameKm: raw.name_km,
    type: raw.type,
    price: Number(raw.price),
    discount_price: typeof raw.discount_price === 'number' ? raw.discount_price : undefined,
    images: raw.images || [],
    colors: raw.colors || [],
    description: raw.description || '',
    descriptionKm: raw.description_km,
    features: raw.features || [],
    featuresKm: raw.features_km || [],
    options: raw.options || {},
    optionsKm: raw.options_km || [],
  }
})

