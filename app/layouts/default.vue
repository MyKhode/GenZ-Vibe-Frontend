<template>
  <div class="min-h-screen bg-background flex flex-col">
    <AppHeader />
    <main class="container mx-auto max-w-7xl px-4 py-6 lg:py-8 flex-1">
      <slot/>
      <div class="mb-7"></div>
      <AppFooter/>
    </main>
    <NavMobile />
    <NavDesktop />
    <AddedToCartModal 
      v-if="!isCartPage"
      :open="showAddedModal"
      :product="modalProduct"
      :count="cartCount"
      @close="showAddedModal = false"
    />
    <ClientOnly>
      <NotifyToasts />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import AppFooter from '~/components/AppFooter.vue'
import NavMobile from '~/components/NavMobile.vue'
import NavDesktop from '~/components/NavDesktop.vue'
import AddedToCartModal from '~/components/AddedToCartModal.vue'
import NotifyToasts from '~/components/NotifyToasts.vue'
import { computed, onMounted, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCart } from '~/composables/useCart'
import type { Product } from '~/types/product'

const route = useRoute()
const cart = useCart()

const isCartPage = computed(() => route.path === '/cart')
const cartCount = computed(() => cart.items.value.length)
const lastAdded = computed(() => cart.lastAdded.value)
const modalProduct = computed<Product | null>(() => lastAdded.value ?? cart.items.value[0] ?? null)
const showAddedModal = computed({
  get: () => cart.showAddedModal.value && !isCartPage.value,
  set: (v: boolean) => (cart.showAddedModal.value = v)
})
const hideDueToCart = ref(false)

onMounted(() => {
  if (cart.items.value.length > 0 && !cart.showAddedModal.value && !isCartPage.value) {
    if (!cart.lastAdded.value) {
      cart.lastAdded.value = cart.items.value[0] ?? null
    }
    cart.showAddedModal.value = true
  }
})

watch(() => cart.items.value.length, (n) => {
  if (n === 0) {
    cart.showAddedModal.value = false
  }
})

watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/cart') {
    hideDueToCart.value = cart.showAddedModal.value
    cart.showAddedModal.value = false
  } else if (oldPath === '/cart') {
    if (hideDueToCart.value && cart.items.value.length > 0) {
      cart.showAddedModal.value = true
    }
    hideDueToCart.value = false
  }
})
</script>
