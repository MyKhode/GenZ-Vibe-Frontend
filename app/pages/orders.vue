<template>
  <OrdersView />
</template>

<script setup lang="ts">
import OrdersView from '~/components/OrdersView.vue'

useHead({
  title: 'Orders | GenZ Vibe',
  meta: [
    { name: 'description', content: 'Track your orders and view order history.' },
    { name: 'robots', content: 'index,follow' }
  ],
  link: [{ rel: 'canonical', href: 'https://example.com/orders' }]
})
</script>
