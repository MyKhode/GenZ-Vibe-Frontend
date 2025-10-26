<template>
  <div class="bg-card rounded-3xl p-6 lg:p-8 border border-border">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <button class="p-2 hover:bg-secondary rounded-lg transition-colors">
        <ArrowLeft class="w-5 h-5 text-muted-foreground" />
      </button>
      
      <div class="flex items-center gap-2">
        <button class="p-2 hover:bg-secondary rounded-lg transition-colors">
          <Headphones class="w-5 h-5 text-muted-foreground" />
        </button>
        <button class="p-2 hover:bg-secondary rounded-lg transition-colors">
          <Volume2 class="w-5 h-5 text-muted-foreground" />
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

    <!-- Rating -->
    <div class="flex items-center gap-1 mb-6">
      <Star 
        v-for="i in product.rating" 
        :key="i"
        class="w-4 h-4 fill-primary text-primary"
      />
    </div>

    <!-- Price & CTA -->
    <div class="space-y-4">
      <div class="text-3xl font-bold text-foreground">
        ${{ product.price.toFixed(2) }}
      </div>
      
      <button class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-colors text-sm uppercase tracking-wide">
        Buy Now
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Headphones, Volume2, Star } from 'lucide-vue-next'
import type { Product } from '~/types/product'

defineProps<{
  product: Product
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
</script>