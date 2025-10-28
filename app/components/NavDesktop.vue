<template>
  <aside class="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-40">
    <div class="flex flex-col gap-4 bg-card border border-border rounded-2xl p-4">
      <NuxtLink 
        to="/"
        class="p-3 rounded-lg transition-colors relative"
        :class="isActive('/') ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'"
        :aria-label="t('nav.home')"
        :title="t('nav.home')"
      >
        <Home class="w-5 h-5" />
      </NuxtLink>

      <NuxtLink 
        to="/cart"
        class="p-3 rounded-lg transition-colors relative"
        :class="isActive('/cart') ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'"
        :aria-label="t('nav.cart')"
        :title="t('nav.cart')"
      >
        <ShoppingCart class="w-5 h-5" />
        <span 
          v-if="cartCount > 0"
          class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center"
        >
          {{ cartCount }}
        </span>
      </NuxtLink>

      <NuxtLink 
        to="/themes"
        class="p-3 rounded-lg transition-colors"
        :class="isActive('/themes') ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'"
        :aria-label="t('nav.themes')"
        :title="t('nav.themes')"
      >
        <Palette class="w-5 h-5" />
      </NuxtLink>

      <NuxtLink 
        to="/orders"
        class="p-3 rounded-lg transition-colors"
        :class="isActive('/orders') ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'"
        :aria-label="t('nav.orders')"
        :title="t('nav.orders')"
      >
        <FileText class="w-5 h-5" />
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, ShoppingCart, FileText, Palette } from 'lucide-vue-next'
import { useCart } from '~/composables/useCart'
import { useI18n } from '~/composables/useI18n'

const route = useRoute()
const isActive = (path: string) => route.path === path

const { items } = useCart()
const cartCount = computed(() => items.value.length)
const { t } = useI18n()
</script>