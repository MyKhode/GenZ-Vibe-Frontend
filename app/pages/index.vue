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

    <!-- Pagination removed: show all products -->
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

const reqUrl = useRequestURL()
const origin = reqUrl.origin
useHead({
  title: 'GenZ Vibe | Premium GenZ Products',
  meta: [
    { name: 'description', content: 'បង្កើនបទពិសោធន៍ថ្មី រសជាតិថ្មី នៅលើទឹកដីចាស់ ! quality, customizable, creativity and premium' },
    { name: 'robots', content: 'index,follow' },
    { property: 'og:title', content: 'GenZ Vibe | Premium GenZ Products' },
    { property: 'og:description', content: 'បង្កើនបទពិសោធន៍ថ្មី រសជាតិថ្មី នៅលើទឹកដីចាស់ ! quality, customizable, creativity and premium' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: origin + '/' },
    { property: 'og:image', content: origin + '/images/cover.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'GenZ Vibe | Premium GenZ Products' },
    { name: 'twitter:description', content: 'បង្កើនបទពិសោធន៍ថ្មី រសជាតិថ្មី នៅលើទឹកដីចាស់ ! quality, customizable, creativity and premium' },
    { name: 'twitter:image', content: origin + '/images/cover.jpg' }
  ],
  link: [{ rel: 'canonical', href: origin + '/' }]
})

const route = useRoute()
const router = useRouter()
const ui = useUiState()

const products = ref<Product[]>([])
const isLoading = ref(true)
// Pagination removed
const page = ref(1)
const pageSize = ref(12)
const hasMore = ref(false)

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
  return result
})

const load = async () => {
  isLoading.value = true
  try {
    const q = (route.query.q as string) || ''
    // fetch all by omitting limit/offset
    const items = await fetchProducts({ search: q })
    products.value = items
    hasMore.value = false
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

watch(() => route.query.q, async () => {
  page.value = 1
  await load()
})

// No-op since pagination removed
const goPage = async (_p: number) => { await load() }

const goToProduct = (product: Product) => {
  router.push(`/products/${product.id}`)
}

const handleApplyFilters = (newFilters: typeof filters.value) => {
  filters.value = newFilters
  ui.showFilters.value = false
}
</script>
