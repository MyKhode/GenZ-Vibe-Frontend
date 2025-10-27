import type { Product } from '~/types/product'

export interface ProductsResponse {
  items: Product[]
}

export async function fetchProducts(params?: { search?: string; limit?: number }): Promise<Product[]> {
  const query: Record<string, any> = {}
  if (params?.search) query.search = params.search
  if (typeof params?.limit === 'number') query.limit = params.limit
  // Use Nuxt-provided $fetch for server/client compatibility
  const res = await $fetch<ProductsResponse>('/api/products', { query })
  return res.items
}
