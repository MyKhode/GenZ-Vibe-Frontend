<template>
  <div 
    class="bg-secondary rounded-xl p-1.5 md:p-4 cursor-pointer hover:bg-secondary/80 transition-colors group"
    @click="$emit('click')"
  >
    <!-- Product Image -->
    <div class="relative mb-0.5 md:mb-2 aspect-square flex items-center justify-center">
      <div 
        class="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg"
      >
        <div class="w-32 h-32 bg-linear-to-br from-muted/50 to-transparent rounded-full absolute blur-2xl"></div>
        <img :src="currentImage" :alt="displayName" class="absolute inset-0 w-full h-full object-cover z-10" />
      </div>
      
      <!-- Image dots reflect all available images -->
      <div v-if="images.length > 1" class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
        <button 
          v-for="(src, i) in images" 
          :key="(src || i) + 'dot'"
          :class="[
            'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 border-background bg-white/70 transition-transform hover:scale-110',
            i === index && 'ring-2 ring-primary ring-offset-2 ring-offset-secondary'
          ]"
          @click.stop="setIndex(i)"
          :aria-label="`Preview ${i+1}`"
          type="button"
        />
      </div>
    </div>

    <!-- Product Info -->
    <div class="space-y-2">
      <div class="flex items-center justify-between gap-3">
        <h3
          class="font-display text-sm md:text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate min-w-0 flex-1"
          :title="displayName"
        >
          {{ displayName }}
        </h3>
        <span class="text-xs md:text-lg font-bold text-foreground shrink-0 whitespace-nowrap">
          <template v-if="product.discount_price && product.discount_price < product.price">
            <span class="text-red-500">${{ Number(product.discount_price).toFixed(2) }}</span>
            <span class="text-muted-foreground line-through ml-1 text-xs md:text-sm">${{ product.price.toFixed(2) }}</span>
          </template>
          <template v-else>
            ${{ product.price.toFixed(2) }}
          </template>
        </span>
      </div>

      <!-- Add to Cart / Quantity Controls -->
      <div class="mt-[-5px] md:mt-2">
        <button 
          v-if="qtyInCart === 0"
          class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-colors text-sm inline-flex items-center justify-center gap-2"
          @click.stop="addToCart()"
        >
          <ShoppingCart class="w-4 h-4" />
          {{ t('product.addToCart') }}
        </button>
        <div v-else class="w-full flex items-center justify-center gap-3">
          <button 
            class="w-9 h-9 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-lg font-bold border border-border"
            @click.stop="decrement()"
            aria-label="Decrease quantity"
          >-</button>
          <span class="flex-1 h-9 inline-flex items-center justify-center text-center text-base font-semibold rounded-lg border border-border bg-secondary text-foreground">{{ qtyInCart }}</span>
          <button 
            class="w-9 h-9 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-lg font-bold border border-border"
            @click.stop="increment()"
            aria-label="Increase quantity"
          >+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Product } from '~/types/product'
import { ShoppingCart } from 'lucide-vue-next'
import { useCart } from '~/composables/useCart'
import { useI18n } from '~/composables/useI18n'

const props = defineProps<{
  product: Product
}>()

defineEmits<{
  click: []
}>()

const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    white: 'bg-gray-100',
    pink: 'bg-pink-400',
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-500'
  }
  return colorMap[color] || 'bg-gray-400'
}

// Rotate images on hover with fast first-time preview
const index = ref(0)

const setIndex = (i: number) => {
  index.value = i % Math.max(1, images.value.length)
}

// No auto-swap on hover; dots are manual selector only

// Build absolute image URL: prefix relative paths with public api base
const runtimeConfig = useRuntimeConfig()
const apiBase = (runtimeConfig.public?.apiBase || '') as string
const toAbsolute = (src: string): string => {
  if (!src) return ''
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) return src
  const base = apiBase.replace(/\/$/, '')
  const path = src.replace(/^\//, '')
  return base ? `${base}/${path}` : `/${path}`
}
// Derive images from options.addons; fallback to product.images
type AddonItem = { id?: number; name?: string; price?: number; image?: string | null }
const addonsObj = computed<Record<string, AddonItem[]>>(() => {
  const opts = (props.product as any)?.options
  const obj = typeof opts === 'string' ? safeParse(opts) : (opts || {})
  return (obj?.addons || {}) as Record<string, AddonItem[]>
})
const addonGroups = computed<[string, AddonItem[]][]>(() => Object.entries(addonsObj.value))
const colorItems = computed<AddonItem[]>(() => {
  const entry = Object.entries(addonsObj.value).find(([k]) => /color/i.test(k))
  return Array.isArray(entry?.[1]) ? (entry![1] as AddonItem[]) : []
})
const colorGroupKey = computed<string>(() => {
  const entry = Object.entries(addonsObj.value).find(([k]) => /color/i.test(k))
  return entry ? entry[0] : ''
})
const images = computed<string[]>(() => {
  const addonImgs = Object.values(addonsObj.value)
    .flatMap(arr => (Array.isArray(arr) ? arr : []) as AddonItem[])
    .map(it => it.image)
    .filter((s): s is string => !!s)
  const legacy = (props.product.images || []) as string[]
  return addonImgs.length ? addonImgs : legacy
})
const currentImage = computed<string>(() => toAbsolute(images.value[index.value] || ''))

// Cart interactions
const cart = useCart()
const qtyInCart = computed(() => cart.countOf(props.product.id))
function buildSelectedMeta() {
  // Try to map current image index to a color option index if possible
  const img = images.value[index.value]
  let selectedOptions: Record<string, number> | undefined
  if (colorItems.value.length && colorGroupKey.value) {
    const idx = colorItems.value.findIndex(it => it.image === img)
    if (idx >= 0) selectedOptions = { [colorGroupKey.value]: idx }
  }
  return { selectedImage: img, selectedOptions }
}
const addToCart = () => {
  const meta = buildSelectedMeta()
  cart.add({ ...(props.product as any), ...meta })
}
const increment = () => {
  const meta = buildSelectedMeta()
  cart.add({ ...(props.product as any), ...meta })
}
const decrement = () => cart.removeOne(props.product.id)
const { locale, t } = useI18n()
const displayName = computed(() => locale.value === 'km' ? (props.product as any).nameKm || props.product.name : props.product.name)

function safeParse(s: string) {
  try { return JSON.parse(s) } catch { return {} }
}
</script>
