<template>
  <div class="text-start">
    <h1 class="font-display text-4xl lg:text-5xl font-bold text-foreground mb-8">
      {{ t('nav.orders') }}
    </h1>

    <!-- Not logged in -->
    <div v-if="!isLoggedIn" class="text-center py-16">
      <Package class="w-24 h-24 text-muted-foreground mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-foreground mb-2">
        {{ t('orders.loginRequired') }}
      </h2>
      <p class="text-muted-foreground mb-6">
        {{ t('orders.loginMessage') }}
      </p>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="text-center py-16">
      <div
        class="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"
      ></div>
      <p class="text-muted-foreground mt-4">{{ t('orders.loading') }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="orders.length === 0" class="text-center py-16">
      <Package class="w-24 h-24 text-muted-foreground mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-foreground mb-2">
        {{ t('orders.empty') }}
      </h2>
      <p class="text-muted-foreground mb-6">
        {{ t('orders.emptyMessage') }}
      </p>
    </div>

    <!-- Orders List -->
    <div v-else>
      <div class="flex justify-between items-center mb-6">
        <p class="text-muted-foreground">
          {{ t('orders.total').replace('{count}', String(orders.length)) }}
        </p>
        <button
          class="text-sm text-primary hover:underline"
          @click="fetchOrders"
        >
          {{ t('orders.refresh') }}
        </button>
      </div>

      <div class="space-y-6">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-card rounded-2xl p-6 border border-border"
        >
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-border"
          >
            <div>
              <h3 class="font-bold text-foreground text-lg mb-1">
                {{ t('orders.orderNumber').replace('{id}', order.id) }}
              </h3>
              <p class="text-sm text-muted-foreground">
                {{ formatDate(order.created_at) }}
              </p>
            </div>
            <div class="text-xl font-bold text-foreground">
              ${{ Number(order.price || 0).toFixed(2) }}
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex gap-4">
              <div
                class="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <Headphones class="w-12 h-12 text-foreground/80" />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-foreground">
                  {{ order.product_name }}
                </h4>
                <p class="text-sm text-muted-foreground">
                  {{ order.product_option }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ t('orders.quantity') }}: {{ order.quantity }}
                </p>
              </div>
            </div>

            <div
              v-if="order.user_info"
              class="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3"
            >
              <p class="font-semibold text-foreground mb-1">
                {{ t('orders.deliveryInfo') }}
              </p>
              <p>{{ order.user_info }}</p>
            </div>

            <div v-if="order.note" class="text-sm text-muted-foreground">
              <span class="font-semibold text-foreground">
                {{ t('orders.note') }}:
              </span>
              {{ order.note }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="orders.length"
      class="mt-8 flex items-center justify-center gap-4"
    >
      <button
        class="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50"
        :disabled="page === 1"
        @click="goPage(page - 1)"
      >
        Previous
      </button>
      <span class="text-sm text-muted-foreground">Page {{ page }}</span>
      <button
        class="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50"
        :disabled="!hasMore"
        @click="goPage(page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Package, Headphones } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'
import { useI18n } from '~/composables/useI18n'

const api = useApi()
const auth = useAuth()
const { t } = useI18n()
const isLoggedIn = computed(() => !!auth.token.value)

type Order = any
const orders = ref<Order[]>([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(false)
const loading = ref(false)
const isAdmin = computed(() => Boolean((auth.profile.value as any)?.is_admin))

const fetchOrders = async () => {
  if (!isLoggedIn.value) return
  loading.value = true
  try {
    const endpoint = isAdmin.value ? '/orders/admin' : '/orders/my'
    const offset = (page.value - 1) * pageSize.value
    const url = new URL(api.url(endpoint))
    url.searchParams.set('offset', String(offset))
    url.searchParams.set('limit', String(pageSize.value))
    const res = await fetch(url.toString(), {
      headers: { Authorization: auth.token.value ? `Bearer ${auth.token.value}` : '' },
    })
    if (!res.ok) throw new Error('Failed to load orders')
    const data = await res.json()
    const list = Array.isArray(data) ? data : []
    orders.value = list
    hasMore.value = list.length === pageSize.value
  } catch (e) {
    console.error(e)
    orders.value = []
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

onMounted(() => {
  auth.loadFromStorage()
  if (isLoggedIn.value) fetchOrders()
})

watch(
  () => auth.token.value,
  (v) => {
    if (v) fetchOrders()
  }
)

const goPage = async (p: number) => {
  if (p < 1) return
  page.value = p
  await fetchOrders()
}
</script>
