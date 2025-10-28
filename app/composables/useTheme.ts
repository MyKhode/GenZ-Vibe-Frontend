import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'

const isClient = typeof window !== 'undefined'
const saved = isClient ? (window.localStorage.getItem('theme') as Theme | null) : null
const themeRef = ref<Theme>(saved || 'dark')

function applyTheme(t: Theme) {
  if (!isClient) return
  const root = document.documentElement
  if (t === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

// Apply on load
applyTheme(themeRef.value)

// Persist + apply on change
watch(themeRef, (t) => {
  if (isClient) window.localStorage.setItem('theme', t)
  applyTheme(t)
})

export function useTheme() {
  const theme = themeRef
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }
  return { theme, toggleTheme }
}

