import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { fetchThemes, type ThemeItem } from '~/services/themes'

export const useThemeList = () => {
  const api = useApi()
  const themes = ref<ThemeItem[]>([])
  const categories = ref<string[]>([])

  const loadThemes = async () => {
    const items = await fetchThemes({ limit: 100 })
    themes.value = items
    categories.value = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[]
  }

  const downloadTheme = async (themeFile: string, themeName: string) => {
    try {
      const response = await fetch(themeFile)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${themeName}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('Download error:', error)
      return false
    }
  }

  const getThemesByCategory = (category?: string) => {
    const list = themes.value
    if (!category) return list
    return list.filter(t => t.category === category)
  }

  const getThemeById = async (id: string) => {
    try {
      const res = await fetch(api.url(`/themes/${encodeURIComponent(id)}`))
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  return {
    themes,
    categories,
    loadThemes,
    getThemeById,
    downloadTheme,
    getThemesByCategory
  }
}
