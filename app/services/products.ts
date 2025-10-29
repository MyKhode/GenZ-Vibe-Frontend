import type { Product } from '~/types/product'

export interface ProductsResponse {
  items: Product[]
}

export async function fetchProducts(params?: { search?: string; limit?: number; offset?: number }): Promise<Product[]> {
  const query: Record<string, any> = {}
  if (params?.search) query.search = params.search
  if (typeof params?.limit === 'number') query.limit = params.limit
  if (typeof params?.offset === 'number') query.offset = params.offset
  // Use Nuxt-provided $fetch for server/client compatibility
  const res = await $fetch<ProductsResponse>('/api/products', { query })
  return res.items
}

export async function fetchProductById(id: number): Promise<Product | null> {
  if (!Number.isFinite(id)) return null
  try {
    const prod = await $fetch<Product | any>(`/api/products/${encodeURIComponent(id)}`)
    // server proxy returns mapped object; cast to Product-compatible shape
    return prod as Product
  } catch {
    return null
  }
}
