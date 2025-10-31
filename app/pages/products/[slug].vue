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
        <!-- Static image area tied to selected option -->
        <div class="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-secondary mb-4">
          <img 
            v-if="currentImage"
            :src="currentImage"
            :alt="pName"
            class="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />

          <!-- Image dots for all available addon images -->
          <div v-if="images.length > 1" class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              v-for="(src, i) in images"
              :key="(src || i) + 'dot'"
              type="button"
              :class="[
                'w-4 h-4 rounded-full border-2 border-background bg-white/70 transition-transform hover:scale-110',
                i === selectedImageIndex && 'ring-2 ring-primary ring-offset-2 ring-offset-secondary'
              ]"
              :aria-label="`Image ${i+1}`"
              @click.stop="selectedImageIndex = i"
            />
          </div>
        </div>
      </section>

      <!-- Right: description and other details (desktop); follows image on mobile) -->
      <section>
        <!-- Right column: Basic info and actions (desktop) / below image on mobile -->
        <h1 class="font-display text-3xl lg:text-5xl font-bold text-foreground mb-3">
          {{ product.name }}
        </h1>

        <div class="text-2xl font-bold text-foreground mb-4">
          <template v-if="product.discount_price && product.discount_price < product.price">
            <span class="text-red-500">${{ Number(product.discount_price).toFixed(2) }}</span>
            <span class="text-muted-foreground line-through ml-3 text-xl">${{ product.price.toFixed(2) }}</span>
          </template>
          <template v-else>
            ${{ product.price.toFixed(2) }}
          </template>
        </div>

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
                class="w-13.5 h-13.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-lg font-bold border border-border"
                @click="decrement()"
                aria-label="Decrease quantity"
              >-</button>
              <span class="flex-1 h-13.5 inline-flex items-center justify-center text-center text-lg font-semibold rounded-lg border border-border bg-secondary text-foreground">{{ qtyInCart }}</span>
              <button 
                class="w-13.5 h-13.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-lg font-bold border border-border"
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

        <!-- Render selection controls for all addon groups -->
        <div v-for="group in addonGroups" :key="group.key" class="mb-6">
          <template v-if="group.items && group.items.length">
            <p class="text-xs text-muted-foreground mb-2">{{ group.label || group.key }}</p>
            <div class="flex flex-wrap gap-2" role="radiogroup" :aria-label="group.label || group.key">
            <button
              v-for="(it, i) in group.items"
              :key="it.id ?? it.name ?? i"
              type="button"
              class="px-3 py-2 rounded-lg border text-sm transition-colors"
              :class="(selectedIndexByGroup[group.key] ?? 0) === i ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-foreground border-border hover:bg-secondary/80'"
              :aria-checked="(selectedIndexByGroup[group.key] ?? 0) === i"
              role="radio"
              @click="selectGroupItem(group.key, i, it.image as any)"
            >
              {{ it.name }}
            </button>
            </div>
          </template>
        </div>

        <div class="mb-6" v-if="normalizedFeatures.length">
          <h3 class="font-semibold text-foreground mb-2">Features</h3>
          <ul class="space-y-2 list-disc pl-5">
            <li v-for="(feature, i) in normalizedFeatures" :key="i + '-' + feature" class="text-sm text-muted-foreground">{{ feature }}</li>
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
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShoppingCart } from 'lucide-vue-next'
import type { Product } from '~/types/product'
import { fetchProducts, fetchProductById } from '~/services/products'
import { toSlug } from '~/utils/slug'
import { useCart } from '~/composables/useCart'
import { useI18n } from '~/composables/useI18n'

const route = useRoute()
const router = useRouter()
const { add, clear, removeOne, countOf } = useCart()

const slug = computed(() => route.params.slug as string)

const { data: productData } = await useAsyncData(`product-${slug.value}` , async () => {
  const s = slug.value
  const idNum = Number(s)
  if (Number.isFinite(idNum)) {
    const byId = await fetchProductById(idNum)
    if (byId) return byId
  }
  const items = await fetchProducts()
  return items.find((p) => toSlug(p.name) === s) || null
})

const product = computed<Product | null>(() => productData.value ?? null)
// Parse options.addons into an array of groups
type AddonItem = { id?: number; name?: string; price?: number; image?: string | null }
type AddonGroup = { key: string; label?: string; items: AddonItem[] }
const addonsObj = computed<Record<string, AddonItem[]>>(() => {
  const opts = (product.value as any)?.options
  const obj = typeof opts === 'string' ? safeParse(opts) : (opts || {})
  return (obj?.addons || {}) as Record<string, AddonItem[]>
})
const addonGroups = computed<AddonGroup[]>(() => {
  return Object.entries(addonsObj.value).map(([key, items]) => ({ key, label: key, items: Array.isArray(items) ? items : [] }))
})
const colorGroup = computed<AddonGroup | null>(() => addonGroups.value.find(g => /color/i.test(g.key)) || null)
const colorItems = computed<AddonItem[]>(() => (colorGroup.value?.items || []))
const colorGroupKey = computed<string>(() => colorGroup.value?.key || '')

// Build flat images array from all addon items
type ImageIndexRef = { src: string; groupKey: string; itemIndex: number }
const imageIndexMap = computed<ImageIndexRef[]>(() => {
  const out: ImageIndexRef[] = []
  for (const g of addonGroups.value) {
    const arr = g.items || []
    arr.forEach((it, idx) => {
      if (it?.image) out.push({ src: it.image, groupKey: g.key, itemIndex: idx })
    })
  }
  return out
})
const images = computed<string[]>(() => imageIndexMap.value.map(x => x.src))
const selectedImageIndex = ref(0)
watch(images, (arr) => {
  if (!arr || arr.length === 0) { selectedImageIndex.value = 0; return }
  if (selectedImageIndex.value >= arr.length) selectedImageIndex.value = 0
})
function indexOfImage(src?: string | null): number {
  if (!src) return -1
  return images.value.findIndex(s => s === src)
}
function selectGroupItem(key: string, i: number, image?: string | null) {
  selectedIndexByGroup.value[key] = i
  const idx = indexOfImage(image)
  if (idx >= 0) selectedImageIndex.value = idx
}
const { t, locale } = useI18n()
const selectedIndexByGroup = ref<Record<string, number>>({})
const pName = computed(() => product.value ? (locale.value === 'km' ? ((product.value as any).nameKm || product.value.name) : product.value.name) : '')
const pDesc = computed(() => product.value ? (locale.value === 'km' ? ((product.value as any).descriptionKm || product.value.description) : product.value.description) : '')
// Initialize selection per group when data arrives
watch(addonGroups, (groups) => {
  const next: Record<string, number> = { ...selectedIndexByGroup.value }
  for (const g of groups) {
    if (typeof next[g.key] !== 'number') next[g.key] = 0
  }
  selectedIndexByGroup.value = next
}, { immediate: true, deep: true })

// Prefix product image with public api base when path is relative
const runtimeConfig = useRuntimeConfig()
const apiBase = (runtimeConfig.public?.apiBase || '') as string
const toAbsolute = (src: string): string => {
  if (!src) return ''
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) return src
  const base = apiBase.replace(/\/$/, '')
  const path = src.replace(/^\//, '')
  return base ? `${base}/${path}` : `/${path}`
}
const currentImage = computed(() => {
  const src = images.value[selectedImageIndex.value]
  return src ? toAbsolute(src) : ''
})

// When image preview changes, sync related option selection
watch(selectedImageIndex, (idx) => {
  const meta = imageIndexMap.value[idx]
  if (!meta) return
  // Only update the specific group that owns this image
  selectedIndexByGroup.value = { ...selectedIndexByGroup.value, [meta.groupKey]: meta.itemIndex }
})

const qtyInCart = computed(() => (product.value ? countOf(product.value.id) : 0))

function buildSelectedProduct(p: Product): Product {
  const selectedImage = images.value[selectedImageIndex.value]
  const selectedOptions = { ...selectedIndexByGroup.value }
  return { ...(p as any), selectedImage, selectedOptions }
}
const addToCart = (p: Product) => add(buildSelectedProduct(p))
const buyNow = (p: Product) => {
  clear()
  add(buildSelectedProduct(p), { notify: false })
  router.push('/cart')
}

const increment = () => {
  if (product.value) add(buildSelectedProduct(product.value))
}
const decrement = () => {
  if (product.value) removeOne(product.value.id)
}

const getColorClass = (name: string) => {
  const colorMap: Record<string, string> = {
    white: 'bg-gray-100',
    black: 'bg-gray-900',
    pink: 'bg-pink-400',
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    gray: 'bg-gray-400',
    grey: 'bg-gray-400'
  }
  return colorMap[name] || 'bg-gray-400'
}

const jsonLd = computed(() => {
  if (!product.value) return '{}'
  const p = product.value
  // Collect available images from all addon items for SEO
  const imgs: string[] = addonGroups.value
    .flatMap(g => (g.items || []).map(it => it.image).filter(Boolean) as string[])
    .map((s: string) => toAbsolute(s))
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: imgs,
    brand: { '@type': 'Brand', name: 'GenZ Vibe' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: p.price,
      availability: 'https://schema.org/InStock'
    }
  })
})

function safeParse(s: string) {
  try { return JSON.parse(s) } catch { return {} }
}

// Normalize features: split on literal "\n" and actual newlines
const normalizedFeatures = computed<string[]>(() => {
  const arr = (product.value?.features || []) as string[]
  const out: string[] = []
  for (const raw of arr) {
    if (!raw) continue
    const parts = String(raw)
      .replace(/\\n/g, "\n")
      .split(/\n/)
      .map(s => s.trim())
      .filter(Boolean)
    out.push(...parts)
  }
  return out
})

const reqUrl = useRequestURL()
const origin = reqUrl.origin
const headTitle = computed(() => (product.value ? `${product.value.name} | GenZ Vibe` : 'Product | GenZ Vibe'))
const headDescription = computed(() => product.value?.description || 'Explore premium audio products and detailed specifications.')
const headCanonical = computed(() => `${origin}/products/${String(route.params.slug)}`)
const headImage = computed(() => {
  const rawFirst = (product.value?.images || [])[0] || images.value[0] || ''
  return rawFirst ? toAbsolute(rawFirst) : (origin + '/images/cover.jpg')
})

useHead({
  title: headTitle,
  meta: [
    { name: 'description', content: headDescription },
    { name: 'robots', content: 'index,follow' },
    { property: 'og:title', content: headTitle },
    { property: 'og:description', content: headDescription },
    { property: 'og:type', content: 'product' },
    { property: 'og:url', content: headCanonical },
    { property: 'og:image', content: headImage },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: headTitle },
    { name: 'twitter:description', content: headDescription },
    { name: 'twitter:image', content: headImage }
  ],
  link: [{ rel: 'canonical', href: headCanonical }],
  script: [
    {
      key: 'product-jsonld',
      type: 'application/ld+json',
      innerHTML: jsonLd.value
    }
  ]
})
</script>
