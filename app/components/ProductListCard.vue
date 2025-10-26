<template>
  <div class="bg-card rounded-3xl p-6 lg:p-8 border border-border">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Headphones class="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <button class="p-2 hover:bg-secondary rounded-lg transition-colors">
          <Search class="w-5 h-5 text-muted-foreground" />
        </button>
        <button class="p-2 hover:bg-secondary rounded-lg transition-colors">
          <SlidersHorizontal class="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>

    <!-- Title -->
    <div class="mb-6">
      <h1 class="font-display text-4xl lg:text-5xl font-bold leading-tight mb-2">
        <span class="text-foreground">PEAK</span><br>
        <span class="text-foreground">PREMIUM</span><br>
        <span class="text-primary">AUDIO</span>
      </h1>
      <p class="text-muted-foreground text-sm">Buy Now, Pay Later</p>
    </div>

    <!-- Featured Products -->
    <div class="space-y-4">
      <h2 class="font-display text-xl font-bold text-foreground mb-4">
        Featured<br>
        <span class="text-2xl">PRODUCTS</span>
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProductCard 
          v-for="product in products" 
          :key="product.id"
          :product="product"
          @click="$emit('selectProduct', product)"
        />
      </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-border">
      <button class="p-2 hover:bg-secondary rounded-lg transition-colors">
        <Home class="w-5 h-5 text-muted-foreground" />
      </button>
      <button class="p-3 bg-primary rounded-lg transition-colors">
        <ShoppingCart class="w-5 h-5 text-primary-foreground" />
      </button>
      <button class="p-2 hover:bg-secondary rounded-lg transition-colors">
        <FileText class="w-5 h-5 text-muted-foreground" />
      </button>
      <button class="p-2 hover:bg-secondary rounded-lg transition-colors">
        <Heart class="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Headphones, Search, SlidersHorizontal, Home, ShoppingCart, FileText, Heart } from 'lucide-vue-next'
import type { Product } from '~/types/product'

defineProps<{
  products: Product[]
}>()

defineEmits<{
  selectProduct: [product: Product]
}>()
</script>