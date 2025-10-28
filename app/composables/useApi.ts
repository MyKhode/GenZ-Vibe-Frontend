export const useApi = () => {
  const config = useRuntimeConfig()
  const base = (config.public as any)?.apiBase || ''
  const { token } = useAuth()

  const url = (path: string) => base.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path)

  const post = async (path: string, body: any, opts: RequestInit = {}) => {
    const res = await fetch(url(path), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token.value ? `Bearer ${token.value}` : '',
        ...(opts.headers || {}),
      },
      body: JSON.stringify(body),
      ...opts,
    })
    return res
  }

  const get = async (path: string, opts: RequestInit = {}) => {
    const res = await fetch(url(path), {
      method: 'GET',
      headers: {
        Authorization: token.value ? `Bearer ${token.value}` : '',
        ...(opts.headers || {}),
      },
      ...opts,
    })
    return res
  }

  return { url, post, get }
}
