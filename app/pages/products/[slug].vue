<template>
  <div v-if="product" class="bg-transparent">
    <!-- Breadcrumbs for SEO/internal linking -->
    <nav class="text-sm mb-4 text-muted-foreground" aria-label="Breadcrumb">
      <NuxtLink class="hover:underline" to="/">{{ t('nav.home') }}</NuxtLink>
      <span class="mx-2">/</span>
      <span class="text-foreground">{{ product.name }}</span>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left: Basic info and image (desktop); full on mobile -->
      <section>
        <!-- Left column: Image only on desktop; top on mobile -->
        <ProductGallery :images="images" :alt="pName" :colors="product.colors" class="mb-4" />
      </section>

      <!-- Right: description and other details (desktop); follows image on mobile) -->
      <section>
        <!-- Right column: Basic info and actions (desktop) / below image on mobile -->
        <h1 class="font-display text-3xl lg:text-5xl font-bold text-foreground mb-3">
          {{ product.name }}
        </h1>

        <div class="text-2xl font-bold text-foreground mb-4">${{ product.price.toFixed(2) }}</div>

        <div class="flex gap-3 mb-6 items-center">
          <div class="flex-1">
            <button 
              v-if="qtyInCart === 0"
              class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 lg:py-4 rounded-xl transition-colors text-sm uppercase tracking-wide inline-flex items-center justify-center gap-2"
              @click="addToCart(product)"
            >
              <ShoppingCart class="w-4 h-4" />
              {{ t('product.addToCart') }}
            </button>
            <div v-else class="w-full flex items-center justify-center gap-4">
              <button 
                class="w-10 h-10 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-lg font-bold border border-border"
                @click="decrement()"
                aria-label="Decrease quantity"
              >-</button>
              <span class="flex-1 h-10 inline-flex items-center justify-center text-center text-lg font-semibold rounded-lg border border-border bg-secondary text-foreground">{{ qtyInCart }}</span>
              <button 
                class="w-10 h-10 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-lg font-bold border border-border"
                @click="increment()"
                aria-label="Increase quantity"
              >+</button>
            </div>
          </div>
          <button 
            class="px-6 bg-secondary hover:bg-secondary/80 text-foreground font-bold py-3 lg:py-4 rounded-xl transition-colors"
            @click="buyNow(product)"
          >
            {{ t('product.buyNow') }}
          </button>
        </div>

        <h2 class="sr-only">Product details</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">{{ pDesc }}</p>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div v-if="(product.options?.length || 0) > 0">
            <p class="text-xs text-muted-foreground mb-1">{{ t('product.option') }}</p>
            <select v-model="selectedOption" class="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm">
              <option v-for="op in pOptions" :key="op" :value="op">{{ op }}</option>
            </select>
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">{{ t('product.availableColors') }}</p>
            <div class="flex gap-2">
              <span 
                v-for="(color, idx) in product.colors"
                :key="idx"
                class="w-6 h-6 rounded-full border border-border"
                :class="getColorClass(color)"
                :aria-label="color"
              />
            </div>
          </div>
        </div>

        <div class="mb-6" v-if="product.features?.length">
          <h3 class="font-semibold text-foreground mb-2">Features</h3>
          <ul class="space-y-2 list-disc pl-5">
            <li v-for="feature in product.features" :key="feature" class="text-sm text-muted-foreground">{{ feature }}</li>
          </ul>
        </div>

        <!-- Buttons are moved under image in the left column -->
      </section>
    </div>

  </div>

  <div v-else>
    <p class="text-muted-foreground">{{ t('general.productNotFound') }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShoppingCart } from 'lucide-vue-next'
import type { Product } from '~/types/product'
import { fetchProducts } from '~/services/products'
import { toSlug } from '~/utils/slug'
import { useCart } from '~/composables/useCart'
import ProductGallery from '~/components/ProductGallery.vue'
import { useI18n } from '~/composables/useI18n'

const route = useRoute()
const router = useRouter()
const { add, clear, removeOne, countOf } = useCart()

const slug = computed(() => route.params.slug as string)

const { data: productData } = await useAsyncData(`product-${slug.value}` , async () => {
  const items = await fetchProducts()
  return items.find((p) => toSlug(p.name) === slug.value) || null
})

const product = computed<Product | null>(() => productData.value ?? null)
const images = computed(() => (product.value?.images ?? []))
const { t, locale } = useI18n()
const selectedOption = ref<string | undefined>(product.value?.options?.[0])
const pName = computed(() => product.value ? (locale.value === 'km' ? ((product.value as any).nameKm || product.value.name) : product.value.name) : '')
const pDesc = computed(() => product.value ? (locale.value === 'km' ? ((product.value as any).descriptionKm || product.value.description) : product.value.description) : '')
const pOptions = computed<string[]>(() => {
  const p = product.value as any
  if (!p) return []
  if (locale.value === 'km') return p.optionsKm || p.options || []
  return p.options || []
})

const qtyInCart = computed(() => (product.value ? countOf(product.value.id) : 0))

const addToCart = (p: Product) => add(p)
const buyNow = (p: Product) => {
  clear()
  add(p, { notify: false })
  router.push('/cart')
}

const increment = () => {
  if (product.value) add(product.value)
}
const decrement = () => {
  if (product.value) removeOne(product.value.id)
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

const jsonLd = computed(() => {
  if (!product.value) return '{}'
  const p = product.value
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: images.value,
    brand: { '@type': 'Brand', name: 'Peak Audio' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: p.price,
      availability: 'https://schema.org/InStock'
    }
  })
})

useHead(() => {
  const title = product.value ? `${product.value.name} | Peak Premium Audio` : 'Product | Peak Premium Audio'
  const description = product.value?.description || 'Explore premium audio products and detailed specifications.'
  const canonical = `https://example.com/products/${route.params.slug}`
  return {
    title,
    meta: [
      { name: 'description', content: description },
      { name: 'robots', content: 'index,follow' }
    ],
    link: [{ rel: 'canonical', href: canonical }],
    script: [
      {
        key: 'product-jsonld',
        type: 'application/ld+json',
        children: jsonLd.value
      }
    ]
  }
})
</script>
