<template>
  <div 
    class="bg-secondary rounded-xl p-1.5 md:p-4 cursor-pointer hover:bg-secondary/80 transition-colors group"
    @click="$emit('click')"
  >
    <!-- Product Image -->
    <div class="relative mb-0.5 md:mb-4 aspect-square flex items-center justify-center">
      <div class="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
        <div class="w-32 h-32 bg-linear-to-br from-muted/50 to-transparent rounded-full absolute blur-2xl"></div>
        <img :src="currentImage" :alt="displayName" class="absolute inset-0 w-full h-full object-cover z-10" />
      </div>
      
      <!-- Color/Image Dots: count = images.length; color cycles through product.colors -->
      <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
        <button 
          v-for="(src, i) in product.images" 
          :key="src + 'dot' + i"
          :class="[
            'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 border-background transition-transform hover:scale-110',
            getColorClass(dotColor(i)),
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
          class="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors truncate min-w-0 flex-1"
          :title="displayName"
        >
          {{ displayName }}
        </h3>
        <span class="text-lg font-bold text-foreground shrink-0 whitespace-nowrap">
          ${{ product.price.toFixed(2) }}
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
import { ref, computed, onBeforeUnmount } from 'vue'
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
let rotateTimer: number | undefined
let previewTimer: number | undefined
const PREVIEW_INTERVAL = 80   // much faster first-hover preview
const QUICK_INTERVAL = 1200   // a little slower for subsequent hovers
const firstHoverDone = ref(false)

const setIndex = (i: number) => {
  index.value = i % (props.product.images?.length || 1)
}

const startQuickRotate = () => {
  if (rotateTimer) clearInterval(rotateTimer)
  rotateTimer = window.setInterval(() => {
    setIndex(index.value + 1)
  }, QUICK_INTERVAL)
}

const startRotate = () => {
  stopRotate()
  const len = props.product.images?.length || 0
  if (len <= 1) return

  if (!firstHoverDone.value) {
    // Rapid preview through all images once, then switch to quick rotate
    let stepsRemaining = Math.max(len - 1, 1)
    previewTimer = window.setInterval(() => {
      setIndex(index.value + 1)
      stepsRemaining--
      if (stepsRemaining <= 0) {
        if (previewTimer) clearInterval(previewTimer)
        previewTimer = undefined
        firstHoverDone.value = true
        startQuickRotate()
      }
    }, PREVIEW_INTERVAL)
  } else {
    startQuickRotate()
  }
}

const stopRotate = () => {
  if (previewTimer) {
    clearInterval(previewTimer)
    previewTimer = undefined
  }
  if (rotateTimer) {
    clearInterval(rotateTimer)
    rotateTimer = undefined
  }
  index.value = 0
}

onBeforeUnmount(stopRotate)

const currentImage = computed<string>(() => props.product.images?.[index.value] || '')
const dotColor = (i: number): string => {
  const colors: string[] = props.product.colors
  if (!colors || colors.length === 0) return 'gray'
  return colors[i % colors.length] as string
}

// Cart interactions
const cart = useCart()
const qtyInCart = computed(() => cart.countOf(props.product.id))
const addToCart = () => cart.add(props.product)
const increment = () => cart.add(props.product)
const decrement = () => cart.removeOne(props.product.id)
const { locale, t } = useI18n()
const displayName = computed(() => locale.value === 'km' ? (props.product as any).nameKm || props.product.name : props.product.name)
</script>
