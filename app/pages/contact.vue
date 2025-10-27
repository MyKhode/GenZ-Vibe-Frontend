<template>
  <ContactView />
</template>

<script setup lang="ts">
import ContactView from '~/components/ContactView.vue'

useHead({
  title: 'Contact | Peak Premium Audio',
  meta: [
    { name: 'description', content: 'Contact Peak Audio for support and inquiries.' },
    { name: 'robots', content: 'index,follow' }
  ],
  link: [{ rel: 'canonical', href: 'https://example.com/contact' }]
})
</script>

