<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="handleBackdropClick"
      >
        <div 
          class="bg-card rounded-3xl p-6 lg:p-8 border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <button 
              class="p-2 hover:bg-secondary rounded-lg transition-colors"
              @click="$emit('close')"
            >
              <X class="w-5 h-5 text-muted-foreground" />
            </button>
            
            <div class="flex items-center gap-2">
              <button class="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Heart class="w-5 h-5 text-muted-foreground" />
              </button>
              <button class="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Share2 class="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <!-- Product Image -->
          <div class="relative mb-8 aspect-square flex items-center justify-center">
            <div class="relative w-full h-full flex items-center justify-center">
              <div class="w-48 h-48 bg-gradient-to-br from-primary/20 to-transparent rounded-full absolute blur-3xl"></div>
              <Headphones class="w-56 h-56 text-foreground relative z-10" />
            </div>
            
            <!-- Color Selector -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              <button 
                v-for="(color, idx) in product.colors" 
                :key="idx"
                :class="[
                  'w-8 h-8 rounded-full border-2 border-background transition-all hover:scale-110',
                  getColorClass(color),
                  idx === 0 && 'ring-2 ring-primary ring-offset-2 ring-offset-card'
                ]"
              />
            </div>
          </div>

          <!-- Product Specs -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p class="text-xs text-muted-foreground mb-1">Type</p>
              <p class="font-semibold text-foreground">{{ product.type }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">Microphone</p>
              <p class="font-semibold text-foreground">{{ product.microphone }}</p>
            </div>
          </div>

          <!-- Product Name -->
          <h2 class="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {{ product.name.toUpperCase() }}
          </h2>

          <!-- Description -->
          <p class="text-sm text-muted-foreground mb-4 leading-relaxed">
            {{ product.description }}
          </p>

          <!-- Features -->
          <div class="mb-6">
            <h3 class="font-semibold text-foreground mb-2">Features</h3>
            <ul class="space-y-2">
              <li 
                v-for="feature in product.features" 
                :key="feature"
                class="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check class="w-4 h-4 text-primary" />
                {{ feature }}
              </li>
            </ul>
          </div>

          <!-- Rating -->
          <div class="flex items-center gap-1 mb-6">
            <Star 
              v-for="i in product.rating" 
              :key="i"
              class="w-4 h-4 fill-primary text-primary"
            />
          </div>

          <!-- Price & Actions -->
          <div class="space-y-3">
            <div class="text-3xl font-bold text-foreground">
              ${{ product.price.toFixed(2) }}
            </div>
            
            <div class="flex gap-3">
              <button 
                class="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-colors text-sm uppercase tracking-wide"
                @click="handleAddToCart"
              >
                Add to Cart
              </button>
              <button 
                class="px-6 bg-secondary hover:bg-secondary/80 text-foreground font-bold py-4 rounded-xl transition-colors"
                @click="handleBuyNow"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X, Headphones, Star, Heart, Share2, Check } from 'lucide-vue-next'
import type { Product } from '~/types/product'


const emit = defineEmits<{
  close: []
  addToCart: [product: Product]
  buyNow: [product: Product]
}>()

const handleBackdropClick = () => {
  emit('close')
}

const handleAddToCart = () => {
  emit('addToCart', props.product)
}

const handleBuyNow = () => {
  emit('buyNow', props.product)
}

const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    white: 'bg-gray-100',
    pink: 'bg-pink-400',
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-500'
  }
  return colorMap[color] || 'bg-gray-400'
}

const props = defineProps<{
  product: Product
  isOpen: boolean
}>()
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>
