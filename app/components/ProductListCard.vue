<template>
  <section>
    <!-- Title (hidden on mobile) -->
    <div class="hidden sm:flex items-center justify-between mb-4">
      <h2 class="font-display text-2xl lg:text-3xl font-bold text-foreground">Products</h2>
      <div class="text-sm text-muted-foreground" v-if="filtered.length">{{ filtered.length }} items</div>
    </div>

    <!-- Category selector -->
    <div class="mb-4 flex items-center gap-2 overflow-x-auto">
      <button
        v-for="c in categories"
        :key="c"
        type="button"
        class="px-3 py-1.5 rounded-full border text-sm whitespace-nowrap"
        :class="selected === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-foreground border-border hover:bg-secondary/80'"
        @click="selected = c"
      >
        {{ c }}
      </button>
    </div>

    <!-- Grid -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      <ProductCardSkeleton v-for="i in 8" :key="'sk-'+i" />
    </div>
    <div v-else-if="filtered.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      <ProductCard
        v-for="p in filtered"
        :key="p.id"
        :product="p"
        @click="$emit('selectProduct', p)"
      />
    </div>
    <div v-else class="text-center py-10 text-muted-foreground">No products found.</div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Product } from '~/types/product'
import { fetchProducts } from '~/services/products'
import ProductCard from '~/components/ProductCard.vue'
import ProductCardSkeleton from '~/components/ProductCardSkeleton.vue'

defineEmits<{ selectProduct: [product: Product] }>()

const loading = ref(true)
const items = ref<Product[]>([])

const selected = ref<string>('All')
const categories = computed<string[]>(() => {
  const types = Array.from(new Set(items.value.map(p => (p.type || '').trim()).filter(Boolean)))
  return ['All', ...types]
})
const filtered = computed<Product[]>(() => {
  if (selected.value === 'All') return items.value
  return items.value.filter(p => String(p.type || '').trim().toLowerCase() === selected.value.toLowerCase())
})

onMounted(async () => {
  loading.value = true
  try {
    items.value = await fetchProducts()
  } finally {
    loading.value = false
  }
})
</script>

