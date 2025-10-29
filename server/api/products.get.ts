import { defineEventHandler, getQuery } from 'h3'
import { useRuntimeConfig } from '#imports'

interface Product {
  id: number
  name: string
  type: string
  price: number
  images: string[]
  colors: string[]
  description: string
  features: string[]
  options?: string[]
  // localized fields
  nameKm?: string
  descriptionKm?: string
  featuresKm?: string[]
  optionsKm?: string[]
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'BS-90W Using Bluetooth 2.5Hz',
    nameKm: 'កាស BS-90W Bluetooth 2.5Hz',
    type: 'Wireless',
    price: 169.99,
    images: ['/images/bs90w.png', 'https://www.igearworld.com/cdn/shop/files/kv.png?v=1723114365'],
    colors: ['white', 'pink', 'yellow'],
    description:
      'Play like a legend with a headset designed for performance PC gaming. Immersive HQ audio, the best mic in gaming, and sleek side-facing!',
    descriptionKm:
      'លេងដូចជាតារា ជាមួយកាសដែលរចនាឡើងសម្រាប់ហ្គេមកុំព្យូទ័រដោយផ្តោតលើសមត្ថភាព។ សម្លេងល្អ និងរចនាបែបទំនើប!',
    features: [
      'Wireless connectivity',
      'Premium audio quality',
      'Comfortable design',
    ],
    featuresKm: [
      'តភ្ជាប់ឥតខ្សែ',
      'សម្លេងគុណភាពខ្ពស់',
      'រចនាសមស្រប',
    ],
    options: ['Standard', 'Limited Edition'],
  },
  {
    id: 2,
    name: 'G733 Lightspeed',
    nameKm: 'G733 ល្បឿនខ្ពស់',
    type: 'Wireless',
    price: 119.0,
    images: ['/images/bs90w.png', '/images/bs90w.png', '/images/bs90w.png', '/images/bs90w.png'],
    colors: ['blue', 'white'],
    description:
      'Lightweight wireless gaming headset with advanced audio and customizable LIGHTSYNC RGB lighting.',
    descriptionKm:
      'កាសហ្គេមឥតខ្សែ ទំងន់ស្រាល មានសម្លេងល្អ និងភ្លើង LIGHTSYNC RGB ដែលកែតម្រូវបាន។',
    features: ['Ultra-lightweight design', 'LIGHTSYNC RGB', 'Pro-G drivers', '29-hour battery life'],
    featuresKm: ['ទំងន់ស្រាល', 'ភ្លើង LIGHTSYNC RGB', 'ឧបករណ៍បន្ទះ Pro-G', 'ថាមពលអស់រយៈពេល 29 ម៉ោង'],
    options: ['Black', 'White'],
    optionsKm: ['ខ្មៅ', 'ស'],
  },
]

export default defineEventHandler(async (event) => {
  const { search = '', limit, offset, skip } = getQuery(event) as { search?: string; limit?: string; offset?: string; skip?: string }
  const q = (search || '').toString().trim().toLowerCase()
  const config = useRuntimeConfig()
  const base = (config.public as any)?.apiBase as string | undefined

  // Try proxy to backend if configured
  if (base) {
    try {
      const url = new URL('/products', base.replace(/\/$/, ''))
      if (limit) url.searchParams.set('limit', String(limit))
      if (offset) url.searchParams.set('offset', String(offset))
      else if (skip) url.searchParams.set('offset', String(skip))
      // Backend supports skip/limit; no search param guaranteed
      const res = await $fetch<any>(url.toString(), { method: 'GET' })
      const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : []
      const mapped: Product[] = items.map((it: any) => ({
        id: it.id,
        name: it.name,
        nameKm: it.name_km,
        type: it.type,
        price: Number(it.price),
        // include discount price if provided
        // @ts-ignore - extend shape at runtime; front type includes optional
        discount_price: typeof it.discount_price === 'number' ? it.discount_price : undefined,
        images: it.images || [],
        colors: it.colors || [],
        description: it.description || '',
        descriptionKm: it.description_km,
        features: it.features || [],
        featuresKm: it.features_km || [],
        options: it.options || [],
        optionsKm: it.options_km || [],
      }))
      // Optional search filtering client-side
      const filtered = q
        ? mapped.filter((p) => [p.name, p.type, p.description].some((v) => v.toLowerCase().includes(q)))
        : mapped
      return { items: filtered }
    } catch (e) {
      // fall back to mock
    }
  }

  // Fallback to mock data
  let result = MOCK_PRODUCTS
  if (q) {
    result = result.filter((p) =>
      [p.name, p.type, p.description].some((v) => v.toLowerCase().includes(q))
    )
  }
  if (limit) {
    const n = Number(limit)
    if (!Number.isNaN(n)) {
      result = result.slice(0, n)
    }
  }
  return { items: result }
})
