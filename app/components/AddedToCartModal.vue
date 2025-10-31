<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <!-- Non-blocking toast at bottom; does not cover screen -->
      <div 
        v-if="open" 
        class="fixed inset-x-0 bottom-24 lg:bottom-8 z-[60] pointer-events-none"
        aria-live="polite"
      >
        <div class="container mx-auto max-w-7xl px-4">
          <div class="pointer-events-auto w-full rounded-2xl border border-border bg-card p-2 sm:p-2 shadow-xl">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <img v-if="thumb" :src="thumb" alt="Product image" class="w-10 h-10 rounded-lg object-cover border border-border" />
                <h3 class="font-semibold text-base sm:text-lg truncate">{{ t('cart.addedCount').replace('{count}', String(count)) }}</h3>
              </div>
              <div class="flex items-center gap-2">
                <NuxtLink to="/cart" class="bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-xl text-center hover:bg-primary/90 whitespace-nowrap inline-flex items-center gap-2">
                  <DollarSign class="w-4 h-4" />
                  {{ t('cart.checkout') }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '~/types/product'
import { DollarSign } from 'lucide-vue-next'
import { useI18n } from '~/composables/useI18n'

const props = defineProps<{
  open: boolean
  product: Product | null
  count: number
}>()

defineEmits<{ close: [] }>()

const runtimeConfig = useRuntimeConfig()
const apiBase = (runtimeConfig.public?.apiBase || '') as string
const toAbsolute = (src: string): string => {
  if (!src) return ''
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) return src
  const base = apiBase.replace(/\/$/, '')
  const path = src.replace(/^\//, '')
  return base ? `${base}/${path}` : `/${path}`
}
type AddonItem = { id?: number; name?: string; price?: number; image?: string | null }
function safeParse(s: string) { try { return JSON.parse(s) } catch { return {} } }
function imageOf(p?: Product | null): string {
  if (!p) return ''
  const sel = (p as any)?.selectedImage as string | undefined
  if (sel) return toAbsolute(sel)
  const firstLegacy = (p.images || [])[0]
  if (firstLegacy) return toAbsolute(firstLegacy)
  const raw = (p as any)?.options
  const obj = typeof raw === 'string' ? safeParse(raw) : (raw || {})
  const addons = (obj?.addons || {}) as Record<string, AddonItem[]>
  const first = Object.values(addons)
    .flatMap(arr => (Array.isArray(arr) ? arr : []) as AddonItem[])
    .map(it => it.image)
    .find(Boolean)
  return first ? toAbsolute(first as string) : ''
}

const thumb = computed(() => imageOf(props.product))
const { t } = useI18n()
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all .14s ease-out; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(8px); }
</style>
