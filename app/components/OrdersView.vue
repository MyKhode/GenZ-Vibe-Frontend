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

    <!-- Loading Skeleton -->
    <div v-else-if="loading" class="py-6">
      <div class="space-y-6">
        <div v-for="i in 3" :key="'osk-'+i" class="bg-card rounded-2xl p-6 border border-border">
          <div class="flex justify-between items-center mb-4 pb-4 border-b border-border">
            <div class="space-y-2">
              <div class="h-4 w-40 bg-secondary rounded animate-pulse" />
              <div class="h-3 w-28 bg-secondary/80 rounded animate-pulse" />
            </div>
            <div class="h-6 w-24 bg-secondary rounded animate-pulse" />
          </div>
          <div class="flex gap-4">
            <div class="w-16 h-16 bg-secondary rounded-lg animate-pulse" />
            <div class="flex-1 min-w-0 space-y-2">
              <div class="h-4 w-1/2 bg-secondary rounded animate-pulse" />
              <div class="h-3 w-1/3 bg-secondary/80 rounded animate-pulse" />
              <div class="h-3 w-24 bg-secondary/80 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
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
            <div class="flex items-center gap-3">
              <span class="px-2 py-1 rounded-full text-xs font-medium border"
                    :class="statusClass(order.status)">
                {{ statusText(order.status) }}
              </span>
              <button class="px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-sm" @click="downloadInvoice(order)">
                {{ t('orders.downloadInvoice') }}
              </button>
              <div class="text-xl font-bold text-foreground">
                ${{ Number(order.price || 0).toFixed(2) }}
              </div>
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

// Generate a receipt-styled JPG (same look as checkout receipt)
const downloadInvoice = async (order: any) => {
  const subtotal = Number(order.price || 0)
  const shipping = 0
  const total = subtotal + shipping
  const dateStr = formatDate(order.created_at)

  // Build off-DOM HTML with inline HEX styles and logo
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-99999px'
  container.style.top = '0'
  container.innerHTML = `
    <div style="width:420px;background:#ffffff;color:#111827;padding:16px;border-radius:12px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
      <div style="text-align:center;margin-bottom:12px;">
        <div style="display:flex;gap:8px;align-items:center;justify-content:center;margin-bottom:4px;">
          <img src="/images/logo.png" alt="GenZ Vibe" style="height:22px;width:auto" />
          <div style="font-weight:800;color:#16a34a;font-size:16px;">Order Receipt</div>
        </div>
        <div style="font-size:11px;color:#6b7280;">GenZ Vibe • Tel: 096 407 4300</div>
      </div>
      <div style="border-bottom:1px dashed #d1d5db;padding-bottom:6px;margin-bottom:6px;font-size:12px;">
        <div style="display:flex;justify-content:space-between;margin:2px 0"><span style="color:#6b7280">Order:</span><span style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas; color:#1f2937">#${order.id}</span></div>
        <div style="display:flex;justify-content:space-between;margin:2px 0"><span style="color:#6b7280">Date:</span><span style="color:#1f2937">${dateStr}</span></div>
      </div>
      <div style="border-top:1px solid #d1d5db;border-bottom:1px solid #d1d5db;padding:6px 0;margin:6px 0;">
        <div style="font-weight:600;color:#1f2937;margin-bottom:4px;font-size:12px;">Items</div>
        <div style="font-size:12px;margin-bottom:4px;">
          <div style="display:flex;justify-content:space-between;"><span style="color:#111827">${String(order.product_name || 'Product')}</span><span style="color:#1f2937;font-weight:600">$${subtotal.toFixed(2)}</span></div>
          ${order.product_option ? `<div style=\"color:#9ca3af;font-size:11px;margin-left:8px\">${String(order.product_option)}</div>` : ''}
          <div style="color:#6b7280;font-size:11px;margin-left:8px">${t('orders.quantity') || 'Quantity'}: ${order.quantity || 1}</div>
        </div>
      </div>
      <div style="font-size:12px;margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;margin:2px 0"><span style="color:#6b7280">Subtotal:</span><span style="color:#1f2937">$${subtotal.toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;margin:2px 0"><span style="color:#6b7280">Shipping:</span><span style="color:#1f2937">$${shipping.toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;margin:6px 0;padding-top:6px;border-top:1px solid #d1d5db;font-weight:800;"><span style="color:#1f2937">Total:</span><span style="color:#111827">$${total.toFixed(2)}</span></div>
      </div>
      <div style="background:#f9fafb;border-radius:8px;padding:8px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:12px;color:#6b7280">Payment Method:</span>
        <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:#1f2937">
          <img src="/images/payment.png" alt="KHQR" style="height:20px;width:auto" />
          KHQR
        </div>
      </div>
      <div style="text-align:center;color:#9ca3af;font-size:12px;">Thank you for your order!</div>
    </div>
  `
  document.body.appendChild(container)
  try {
    const html2canvas = await import('html2canvas').then(m => m.default)
    const node = container.firstElementChild as HTMLElement
    const canvas = await html2canvas(node, { backgroundColor: '#ffffff', scale: 2, logging: false, useCORS: true })
    const link = document.createElement('a')
    link.download = `invoice-${order.id}.jpg`
    link.href = canvas.toDataURL('image/jpeg', 0.95)
    link.click()
  } finally {
    document.body.removeChild(container)
  }
}

// Status helpers (shipping/progress status)
const statusText = (raw: string) => {
  const s = String(raw || '').toLowerCase()
  const key = `orders.status.${s}`
  const val = t(key)
  if (val === key || !val) return s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'
  return val
}
const statusClass = (raw: string) => {
  const s = String(raw || '').toLowerCase()
  if (s === 'completed' || s === 'delivered') return 'bg-green-500/10 text-green-400 border-green-500/30'
  if (s === 'shipping' || s === 'shipped' || s === 'in_transit') return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  if (s === 'processing' || s === 'packaging' || s === 'confirmed') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
  if (s === 'canceled' || s === 'cancelled' || s === 'failed') return 'bg-red-500/10 text-red-400 border-red-500/30'
  return 'bg-secondary text-foreground border-border'
}
</script>
