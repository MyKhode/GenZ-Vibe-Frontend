<template>
  <ContactView />
</template>

<script setup lang="ts">
import ContactView from '~/components/ContactView.vue'

useHead({
  title: 'Contact | GenZ Vibe',
  meta: [
    { name: 'description', content: 'Contact GenZ Vibe for support and inquiries.' },
    { name: 'robots', content: 'index,follow' }
  ],
  link: [{ rel: 'canonical', href: 'https://example.com/contact' }]
})
</script>
