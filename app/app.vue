<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { locale } = useI18n()

useHead(() => ({
  htmlAttrs: {
    lang: locale.value || 'km'
  },
  bodyAttrs: {
    class: 'dark'
  },
  title: 'GenZ Vibe — Modern Minimal Products in Cambodia'
}))
</script>

<style>
@import "assets/css/tailwind.css";

* {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--primary)) hsl(var(--secondary));
}

*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

*::-webkit-scrollbar-track {
  background: hsl(var(--secondary));
}

*::-webkit-scrollbar-thumb {
  background: hsl(var(--primary));
  border-radius: 4px;
}

*::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary) / 0.8);
}

/* Make all buttons feel clickable */
button,
[type="button"],
[type="submit"],
[type="reset"],
[role="button"],
.btn {
  cursor: pointer;
}

button:disabled,
[type="button"]:disabled,
[type="submit"]:disabled,
[type="reset"]:disabled {
  cursor: not-allowed;
}
</style>
