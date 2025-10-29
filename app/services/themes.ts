export interface ThemeItem {
  id: string
  title: string
  description?: string
  category?: string
  thumbnail?: string
  file?: string
  downloads?: number
}

export interface ThemesResponse { items: ThemeItem[] }

export async function fetchThemes(params?: { skip?: number; limit?: number }): Promise<ThemeItem[]> {
  const query: Record<string, any> = {}
  if (typeof params?.skip === 'number') query.skip = params.skip
  if (typeof params?.limit === 'number') query.limit = params.limit
  const res = await $fetch<ThemesResponse>('/api/themes', { query })
  return res.items
}

