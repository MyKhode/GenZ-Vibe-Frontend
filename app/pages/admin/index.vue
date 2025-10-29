<template>
  <div>
    <h1 class="font-display text-3xl lg:text-4xl font-bold text-foreground mb-6">Admin Dashboard</h1>

    <div v-if="!isAdmin" class="text-muted-foreground">You do not have permission to view this page.</div>

    <div v-else class="space-y-10">
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-card border border-border rounded-2xl p-4"><p class="text-sm text-muted-foreground">Users</p><p class="text-3xl font-bold text-foreground">{{ stats.users_count }}</p></div>
        <div class="bg-card border border-border rounded-2xl p-4"><p class="text-sm text-muted-foreground">Orders</p><p class="text-3xl font-bold text-foreground">{{ stats.orders_count }}</p></div>
        <div class="bg-card border border-border rounded-2xl p-4"><p class="text-sm text-muted-foreground">Products Sold</p><p class="text-3xl font-bold text-foreground">{{ stats.products_sold }}</p></div>
        <div class="bg-card border border-border rounded-2xl p-4"><p class="text-sm text-muted-foreground">Theme Downloads</p><p class="text-3xl font-bold text-foreground">{{ stats.themes_total_downloads }}</p></div>
      </section>

      <section>
        <div class="flex items-center gap-2 border-b border-border mb-4">
          <button class="px-4 py-2 rounded-t-lg text-sm font-medium" :class="tab === 'products' ? 'bg-card border-x border-t border-border text-foreground' : 'text-muted-foreground hover:text-foreground'" @click="tab='products'">Products</button>
          <button class="px-4 py-2 rounded-t-lg text-sm font-medium" :class="tab === 'themes' ? 'bg-card border-x border-t border-border text-foreground' : 'text-muted-foreground hover:text-foreground'" @click="tab='themes'">Themes</button>
          <button class="px-4 py-2 rounded-t-lg text-sm font-medium" :class="tab === 'orders' ? 'bg-card border-x border-t border-border text-foreground' : 'text-muted-foreground hover:text-foreground'" @click="tab='orders'">Orders</button>
        </div>
        <AdminProductsTab v-show="tab==='products'" />
        <AdminThemesTab v-show="tab==='themes'" />
        <AdminOrdersTab v-show="tab==='orders'" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'
import AdminProductsTab from '~/components/admin/ProductsTab.vue'
import AdminThemesTab from '~/components/admin/ThemesTab.vue'
import AdminOrdersTab from '~/components/admin/OrdersTab.vue'

const api = useApi()
const auth = useAuth()
const isAdmin = computed(() => Boolean((auth.profile.value as any)?.is_admin))
const stats = ref({ users_count: 0, orders_count: 0, products_sold: 0, themes_total_downloads: 0 })
const tab = ref<'products'|'themes'|'orders'>('products')

const loadStats = async () => {
  try {
    const res = await api.get('/admin/stats')
    if (res.ok) stats.value = await res.json()
  } catch {}
}

// Tabs handle their own actions; page only loads stats

onMounted(async () => {
  auth.loadFromStorage()
  await loadStats()
})
</script>
