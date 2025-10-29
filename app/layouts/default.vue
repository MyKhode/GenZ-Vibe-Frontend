<template>
  <div class="min-h-screen bg-background">
    <AppHeader />
    <main class="container mx-auto max-w-7xl px-4 py-6 lg:py-8 min-h-[calc(100vh-5rem)] pb-24 lg:pb-8">
      <slot />
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
    <NotifyToasts />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import NavMobile from '~/components/NavMobile.vue'
import NavDesktop from '~/components/NavDesktop.vue'
import AddedToCartModal from '~/components/AddedToCartModal.vue'
import NotifyToasts from '~/components/NotifyToasts.vue'
import { computed, onMounted, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCart } from '~/composables/useCart'

const route = useRoute()
const cart = useCart()

const isCartPage = computed(() => route.path === '/cart')
const cartCount = computed(() => cart.items.value.length)
const lastAdded = computed(() => cart.lastAdded.value)
const modalProduct = computed(() => lastAdded.value ?? cart.items.value[0] ?? null)
const showAddedModal = computed({
  get: () => cart.showAddedModal.value && !isCartPage.value,
  set: (v: boolean) => (cart.showAddedModal.value = v)
})
const hideDueToCart = ref(false)

onMounted(() => {
  if (cart.items.value.length > 0 && !cart.showAddedModal.value && !isCartPage.value) {
    if (!cart.lastAdded.value) {
      cart.lastAdded.value = cart.items.value[0]
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
    // Remember if it was open so we can restore after leaving cart
    hideDueToCart.value = cart.showAddedModal.value
    cart.showAddedModal.value = false
  } else if (oldPath === '/cart') {
    // Restore toast only if it was shown before entering cart
    if (hideDueToCart.value && cart.items.value.length > 0) {
      cart.showAddedModal.value = true
    }
    hideDueToCart.value = false
  }
})
</script>
