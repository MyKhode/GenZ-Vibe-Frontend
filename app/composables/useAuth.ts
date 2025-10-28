export const useAuth = () => {
  const token = useState<string | null>('auth:token', () => null)
  const profile = useState<Record<string, any> | null>('auth:profile', () => null)

  const setToken = (t: string | null) => {
    token.value = t
    if (typeof window !== 'undefined') {
      if (t) localStorage.setItem('access_token', t)
      else localStorage.removeItem('access_token')
    }
  }

  const setProfile = (p: Record<string, any> | null) => {
    profile.value = p
    if (typeof window !== 'undefined') {
      if (p) localStorage.setItem('profile', JSON.stringify(p))
      else localStorage.removeItem('profile')
    }
  }

  const loadFromStorage = () => {
    if (typeof window === 'undefined') return
    const t = localStorage.getItem('access_token')
    if (t) token.value = t
    const p = localStorage.getItem('profile')
    if (p) try { profile.value = JSON.parse(p) } catch { profile.value = null }
  }

  return { token, profile, setToken, setProfile, loadFromStorage }
}

