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

    <!-- Pagination: Previous | Page X | Next -->
    <div class="mt-8 flex items-center justify-center gap-4">
      <button
        class="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50"
        :disabled="page === 1"
        @click="goPage(page - 1)"
      >
        Previous
      </button>
      <span class="text-sm text-muted-foreground">Page {{ page }}</span>
      <button
        class="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50"
        :disabled="!hasMore"
        @click="goPage(page + 1)"
      >
        Next
      </button>
    </div>
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
    const offset = (page.value - 1) * pageSize.value
    const items = await fetchProducts({ search: q, limit: pageSize.value, offset })
    products.value = items
    hasMore.value = items.length === pageSize.value
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

const goPage = async (p: number) => {
  if (p < 1) return
  page.value = p
  await load()
}

const goToProduct = (product: Product) => {
  router.push(`/products/${product.id}`)
}

const handleApplyFilters = (newFilters: typeof filters.value) => {
  filters.value = newFilters
  ui.showFilters.value = false
}
</script>
