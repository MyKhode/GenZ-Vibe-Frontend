<template>
  <div>
    <HomeView 
      :products="filteredProducts"
      :loading="isLoading"
      :skeleton-count="3"
      @select-product="goToProduct"
    />

    <!-- Filter Modal controlled via global UI state -->
    <FilterModal 
      :is-open="ui.showFilters.value"
      :filters="filters"
      @close="ui.showFilters.value = false"
      @apply="handleApplyFilters"
    />
  </div>
  
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Product } from '~/types/product'
import HomeView from '~/components/HomeView.vue'
import FilterModal from '~/components/FilterModal.vue'
import { fetchProducts } from '~/services/products'
import { toSlug } from '~/utils/slug'
import { useUiState } from '~/composables/useUiState'

useHead({
  title: 'Premium Products | Peak Audio',
  meta: [
    { name: 'description', content: 'Discover premium GenZ goods and audio products.' },
    { name: 'robots', content: 'index,follow' }
  ],
  link: [{ rel: 'canonical', href: 'https://example.com/' }]
})

const route = useRoute()
const router = useRouter()
const ui = useUiState()

const products = ref<Product[]>([])
const isLoading = ref(true)

const filters = ref({
  types: [] as string[],
  priceRange: 'all'
})

const filteredProducts = computed(() => {
  let result = products.value
  if (filters.value.types.length > 0) {
    result = result.filter((p) => filters.value.types.includes(p.type))
  }
  if (filters.value.priceRange !== 'all') {
    result = result.filter((p) => {
      switch (filters.value.priceRange) {
        case 'under100':
          return p.price < 100
        case '100-200':
          return p.price >= 100 && p.price <= 200
        case 'over200':
          return p.price > 200
        default:
          return true
      }
    })
  }
  // rating filter removed from product type
  return result
})

const load = async () => {
  isLoading.value = true
  try {
    const q = (route.query.q as string) || ''
    products.value = await fetchProducts({ search: q })
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await load()
  if (route.query.openFilters) {
    ui.showFilters.value = true
    const { openFilters, ...rest } = route.query
    router.replace({ path: route.path, query: { ...rest } })
  }
})
watch(() => route.query.q, load)

const goToProduct = (product: Product) => {
  router.push(`/products/${toSlug(product.name)}`)
}

const handleApplyFilters = (newFilters: typeof filters.value) => {
  filters.value = newFilters
  ui.showFilters.value = false
}
</script>
