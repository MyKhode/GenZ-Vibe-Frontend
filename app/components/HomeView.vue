<template>
  <div>
    <!-- Hero Section -->
    <div class="mb-8 hidden md:flex">
      <h1 class="font-display text-4xl md:flex gap-2 lg:text-6xl font-bold leading-tight mb-2">
        <span class="text-foreground">PEAK</span><br>
        <span class="text-foreground">PREMIUM</span><br>
        <span class="text-primary">GENZ GOODS</span>
      </h1>
    </div>

    <!-- Featured Products Section -->
    <div class="mb-8">
      <!-- Category Filter -->
      <div class="flex gap-2 mb-4 flex-wrap">
        <button 
          class="px-4 py-2 rounded-lg font-medium transition-colors"
          :class="selectedCategory === '' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'"
          @click="selectedCategory = ''"
        >
          {{ t('themes.all') }}
        </button>
        <button 
          v-for="cat in categories"
          :key="cat"
          class="px-4 py-2 rounded-lg font-medium transition-colors"
          :class="selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
      <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        <ProductCardSkeleton v-for="i in skeletonCount" :key="`s-${i}`" />
      </div>
      <div v-else-if="filtered.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        <ProductCard 
          v-for="product in filtered" 
          :key="product.id"
          :product="product"
          @click="$emit('selectProduct', product)"
        />
      </div>
      
      <div v-else class="text-center py-12">
        <p class="text-muted-foreground">{{ t('empty.noProducts') }}</p>
      </div>
    </div>

    <!-- Promotional Banner (hidden on mobile) -->
    <div class="hidden md:block bg-linear-to-r from-primary/20 to-primary/5 rounded-3xl p-6 lg:p-8 border border-primary/20">
      <h3 class="font-oswald text-2xl lg:text-3xl font-bold text-foreground mb-2">
        {{ t('promo.title') }}
      </h3>
      <p class="text-muted-foreground mb-4">
        {{ t('promo.desc') }}
      </p>
      <NuxtLink to="themes" class="font-oswald bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl transition-colors text-sm uppercase tracking-wide">
        {{ t('promo.cta') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Product } from '~/types/product'
import ProductCardSkeleton from '~/components/ProductCardSkeleton.vue'
import { useI18n } from '~/composables/useI18n'

const props = withDefaults(defineProps<{
  products: Product[]
  loading?: boolean
  skeletonCount?: number
}>(), {
  loading: false,
  skeletonCount: 8
})

defineEmits<{ selectProduct: [product: Product] }>()
const { t } = useI18n()

// Category filter built from product type
const selectedCategory = ref<string>('')
const categories = computed<string[]>(() => {
  const set = new Set<string>()
  for (const p of props.products) {
    const tp = String((p as any).type || '').trim()
    if (tp) set.add(tp)
  }
  return Array.from(set)
})
const filtered = computed<Product[]>(() => {
  if (!selectedCategory.value) return props.products
  return props.products.filter(p => String((p as any).type || '').trim() === selectedCategory.value)
})
</script>
