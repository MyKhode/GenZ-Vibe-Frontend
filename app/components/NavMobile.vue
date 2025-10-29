<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border">
    <div class="flex items-center justify-around py-3 px-4">
      <NuxtLink 
        to="/"
        class="flex flex-col items-center gap-1 p-2 transition-colors"
        :class="isActive('/') ? 'text-primary' : 'text-muted-foreground'"
        :aria-label="t('nav.home')"
      >
        <Home class="w-5 h-5" />
        <span class="text-xs font-medium">{{ t('nav.home') }}</span>
      </NuxtLink>

      <NuxtLink 
        to="/cart"
        class="flex flex-col items-center gap-1 p-2 transition-colors relative"
        :class="isActive('/cart') ? 'text-primary' : 'text-muted-foreground'"
        :aria-label="t('nav.cart')"
      >
        <ShoppingCart class="w-5 h-5" />
        <span class="text-xs font-medium">{{ t('nav.cart') }}</span>
        <span 
          v-if="cartCount > 0"
          class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center"
        >
          {{ cartCount }}
        </span>
      </NuxtLink>

      <NuxtLink 
        to="/themes"
        class="flex flex-col items-center gap-1 p-2 transition-colors"
        :class="isActive('/themes') ? 'text-primary' : 'text-muted-foreground'"
        :aria-label="t('nav.themes')"
      >
        <Palette class="w-5 h-5" />
        <span class="text-xs font-medium">{{ t('Themes') }}</span>
      </NuxtLink>

      <NuxtLink 
        to="/orders"
        class="flex flex-col items-center gap-1 p-2 transition-colors"
        :class="isActive('/orders') ? 'text-primary' : 'text-muted-foreground'"
        :aria-label="t('nav.orders')"
      >
        <Box class="w-5 h-5" />
        <span class="text-xs font-medium">{{ t('nav.orders') }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, ShoppingCart, FileText, Palette, Box } from 'lucide-vue-next'
import { useCart } from '~/composables/useCart'
import { useI18n } from '~/composables/useI18n'

const route = useRoute()
const isActive = (path: string) => route.path === path

const { items } = useCart()
const cartCount = computed(() => items.value.length)
const { t } = useI18n()
</script>