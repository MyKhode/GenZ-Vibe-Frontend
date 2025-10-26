<template>
  <div>
    <!-- Hero Section -->
    <div class="mb-8">
      <h1 class="font-display text-4xl lg:text-6xl font-bold leading-tight mb-2">
        <span class="text-foreground">PEAK</span><br>
        <span class="text-foreground">PREMIUM</span><br>
        <span class="text-primary">AUDIO</span>
      </h1>
      <p class="text-muted-foreground text-sm lg:text-base">Buy Now, Pay Later</p>
    </div>

    <!-- Featured Products Section -->
    <div class="mb-8">
      <h2 class="font-display text-2xl lg:text-3xl font-bold text-foreground mb-6">
        Featured<br>
        <span class="text-3xl lg:text-4xl">PRODUCTS</span>
      </h2>

      <div v-if="products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <ProductCard 
          v-for="product in products" 
          :key="product.id"
          :product="product"
          @click="$emit('selectProduct', product)"
        />
      </div>
      
      <div v-else class="text-center py-12">
        <p class="text-muted-foreground">No products found matching your criteria.</p>
      </div>
    </div>

    <!-- Promotional Banner -->
    <div class="bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl p-6 lg:p-8 border border-primary/20">
      <h3 class="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
        Special Offer
      </h3>
      <p class="text-muted-foreground mb-4">
        Get 20% off on your first purchase. Limited time only!
      </p>
      <button class="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl transition-colors text-sm uppercase tracking-wide">
        Shop Now
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

defineProps<{
  products: Product[]
}>()

defineEmits<{
  selectProduct: [product: Product]
}>()
</script>