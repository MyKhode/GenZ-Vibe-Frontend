<template>
  <div class="min-h-screen bg-background">
    <AppHeader />
    <main class="container mx-auto max-w-7xl px-4 py-6 lg:py-8 min-h-[calc(100vh-5rem)] pb-24 lg:pb-8">
      <slot />
    </main>
    <NavMobile />
    <NavDesktop />
    <AddedToCartModal 
      :open="showAddedModal"
      :product="modalProduct"
      :count="cartCount"
      @close="showAddedModal = false"
    />
  </div>
  
</template>

<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import NavMobile from '~/components/NavMobile.vue'
import NavDesktop from '~/components/NavDesktop.vue'
import AddedToCartModal from '~/components/AddedToCartModal.vue'
import { computed, onMounted, watch } from 'vue'
import { useCart } from '~/composables/useCart'

const cart = useCart()
const cartCount = computed(() => cart.items.value.length)
const lastAdded = computed(() => cart.lastAdded.value)
const modalProduct = computed(() => lastAdded.value || cart.items.value[0] || null)
const showAddedModal = computed({
  get: () => cart.showAddedModal.value,
  set: (v: boolean) => (cart.showAddedModal.value = v)
})

// Show toast if cart has items on refresh/return
onMounted(() => {
  if (cart.items.value.length > 0 && !cart.showAddedModal.value) {
    // ensure lastAdded has a product to show thumbnail
    if (!cart.lastAdded.value) {
      cart.lastAdded.value = cart.items.value[0]
    }
    cart.showAddedModal.value = true
  }
})

// Auto-hide toast when cart becomes empty
watch(() => cart.items.value.length, (n) => {
  if (n === 0) {
    cart.showAddedModal.value = false
  }
})
</script>
