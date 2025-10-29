import { useState } from '#app'

export type NotifyType = 'success' | 'error' | 'info' | 'warning'
export type NotifyItem = { id: number; type: NotifyType; message: string; title?: string; timeout?: number }

export const useNotify = () => {
  const list = useState<NotifyItem[]>('notify:list', () => [])

  const push = (n: Omit<NotifyItem, 'id'>) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    const item: NotifyItem = { id, timeout: 3500, ...n }
    list.value.push(item)
    if (item.timeout && item.timeout > 0) {
      setTimeout(() => remove(id), item.timeout)
    }
    return id
  }

  const remove = (id: number) => {
    const i = list.value.findIndex(t => t.id === id)
    if (i >= 0) list.value.splice(i, 1)
  }

  const success = (message: string, title?: string) => push({ type: 'success', message, title })
  const error = (message: string, title?: string) => push({ type: 'error', message, title, timeout: 5000 })
  const info = (message: string, title?: string) => push({ type: 'info', message, title })
  const warning = (message: string, title?: string) => push({ type: 'warning', message, title })

  return { list, push, remove, success, error, info, warning }
}

