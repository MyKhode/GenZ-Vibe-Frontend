<template>
  <CartView 
    :cart-items="items"
    @remove-from-cart="removeAt"
  />
  
</template>

<script setup lang="ts">
import CartView from '~/components/CartView.vue'
import { useCart } from '~/composables/useCart'

useHead({
  title: 'Cart | Peak Premium Audio',
  meta: [
    { name: 'description', content: 'View and manage items in your shopping cart.' },
    { name: 'robots', content: 'index,follow' }
  ],
  link: [{ rel: 'canonical', href: 'https://example.com/cart' }]
})

const { items, removeAt } = useCart()
</script>
