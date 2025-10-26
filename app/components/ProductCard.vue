<template>
  <div 
    class="bg-secondary rounded-2xl p-4 cursor-pointer hover:bg-secondary/80 transition-colors group"
    @click="$emit('click')"
  >
    <!-- Product Image -->
    <div class="relative mb-4 aspect-square flex items-center justify-center">
      <div class="relative w-full h-full flex items-center justify-center">
        <div class="w-32 h-32 bg-gradient-to-br from-muted/50 to-transparent rounded-full absolute blur-2xl"></div>
        <Headphones class="w-32 h-32 text-foreground/80 relative z-10" />
      </div>
      
      <!-- Color Options -->
      <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        <button 
          v-for="(color, idx) in product.colors" 
          :key="idx"
          :class="[
            'w-6 h-6 rounded-full border-2 border-background transition-transform hover:scale-110',
            getColorClass(color),
            idx === 0 && 'ring-2 ring-primary ring-offset-2 ring-offset-secondary'
          ]"
          @click.stop
        />
      </div>
    </div>

    <!-- Product Info -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs text-muted-foreground">{{ product.type }}</span>
        <div class="flex">
          <Star 
            v-for="i in product.rating" 
            :key="i"
            class="w-3 h-3 fill-primary text-primary"
          />
        </div>
      </div>

      <h3 class="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
        {{ product.name }}
      </h3>

      <div class="flex items-center justify-between">
        <span class="text-lg font-bold text-foreground">
          ${{ product.price.toFixed(2) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Headphones, Star } from 'lucide-vue-next'
import type { Product } from '~/types/product'

defineProps<{
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
</script>