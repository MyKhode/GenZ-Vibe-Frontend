import { useState, useCookie } from '#app'
import { watch } from 'vue'
import type { Product } from '~/types/product'

export const useCart = () => {
  const items = useState<Product[]>('cart:items', () => [])
  const cookie = useCookie<Product[]>('cart_items', { sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })

  // Initialize from cookie once (SSR + client) to avoid hydration shift
  if (cookie.value && items.value.length === 0) {
    items.value = cookie.value
  }

  // Persist to cookie on change (client only)
  if (process.client) {
    watch(items, (val) => {
      cookie.value = val
    }, { deep: true })
  }

  // Notify modal state
  const showAddedModal = useState<boolean>('cart:notifyOpen', () => false)
  const lastAdded = useState<Product | null>('cart:lastAdded', () => null)

  const add = (p: Product, opts?: { notify?: boolean }) => {
    items.value.push(p)
    if (opts?.notify !== false) {
      lastAdded.value = p
      showAddedModal.value = true
    }
  }

  const removeAt = (index: number) => {
    items.value.splice(index, 1)
  }

  const removeOne = (productId: number) => {
    const idx = items.value.findIndex((p) => p.id === productId)
    if (idx !== -1) items.value.splice(idx, 1)
  }

  const countOf = (productId: number) => items.value.filter((p) => p.id === productId).length

  const clear = () => {
    items.value = []
  }

  return { items, add, removeAt, removeOne, countOf, clear, showAddedModal, lastAdded }
}
