<template>
  <div>
    <h1 class="font-display text-4xl lg:text-5xl font-bold text-foreground mb-8">
      {{ t('cart.title') }}
    </h1>

    <div v-if="cartItems.length === 0" class="text-center py-16">
      <ShoppingCart class="w-24 h-24 text-muted-foreground mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-foreground mb-2">{{ t('cart.empty') }}</h2>
      <p class="text-muted-foreground mb-6">{{ t('cart.emptyCta') }}</p>
    </div>

    <div v-else>
      <div class="space-y-4 mb-8">
        <div 
          v-for="(item, index) in cartItems" 
          :key="index"
          class="bg-card rounded-2xl p-4 lg:p-6 border border-border"
        >
          <div class="flex gap-4">
            <!-- Product Image -->
            <div class="w-24 h-24 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
              <Headphones class="w-16 h-16 text-foreground/80" />
            </div>

            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-foreground text-lg mb-1 truncate">{{ item.name }}</h3>
              <p class="text-sm text-muted-foreground mb-2">{{ item.type }}</p>
              
              <p class="text-xl font-bold text-foreground">${{ item.price.toFixed(2) }}</p>
            </div>

            <!-- Remove Button -->
            <button 
              class="p-2 hover:bg-secondary rounded-lg transition-colors self-start"
              @click="$emit('removeFromCart', index)"
            >
              <Trash2 class="w-5 h-5 text-muted-foreground hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      <!-- Cart Summary -->
      <div class="bg-card rounded-2xl p-6 border border-border sticky bottom-24 lg:bottom-8">
        <div class="space-y-3 mb-4">
          <div class="flex justify-between text-foreground">
            <span>{{ t('cart.subtotal') }}</span>
            <span class="font-semibold">${{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-foreground">
            <span>{{ t('cart.shipping') }}</span>
            <span class="font-semibold">$10.00</span>
          </div>
          <div class="flex justify-between text-foreground">
            <span>{{ t('cart.tax') }}</span>
            <span class="font-semibold">${{ tax.toFixed(2) }}</span>
          </div>
          <div class="border-t border-border pt-3 flex justify-between text-foreground text-xl font-bold">
            <span>{{ t('cart.total') }}</span>
            <span>${{ total.toFixed(2) }}</span>
          </div>
        </div>
        
        <button class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-colors text-sm uppercase tracking-wide">
          {{ t('cart.checkout') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ShoppingCart, Headphones, Trash2 } from 'lucide-vue-next'
import type { Product } from '~/types/product'
import { useI18n } from '~/composables/useI18n'

const props = defineProps<{
  cartItems: Product[]
}>()

defineEmits<{
  removeFromCart: [index: number]
}>()

const subtotal = computed(() => {
  return props.cartItems.reduce((sum, item) => sum + item.price, 0)
})

const tax = computed(() => {
  return subtotal.value * 0.08 // 8% tax
})

const total = computed(() => {
  return subtotal.value + 10 + tax.value // +10 for shipping
})
const { t } = useI18n()
</script>
