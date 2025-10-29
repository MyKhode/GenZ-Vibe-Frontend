<template>
  <div>
    <h1 class="font-display text-start text-4xl lg:text-5xl font-bold text-foreground mb-8">
      {{ t('cart.title') }}
    </h1>

    <div v-if="cartItems.length === 0" class="text-start py-16">
      <ShoppingCart class="w-24 h-24 text-muted-foreground mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-foreground mb-2">{{ t('cart.empty') }}</h2>
      <p class="text-muted-foreground mb-6">{{ t('cart.emptyCta') }}</p>
    </div>

    <div v-else>
      <div class="space-y-4 mb-8">
        <div v-for="(item, index) in cartItems" :key="index"
          class="bg-card rounded-2xl p-4 lg:p-6 border border-border">
          <div class="flex gap-4">
            <div
              class="w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-border bg-secondary">
              <img v-if="imageOf(item)" :src="imageOf(item)" :alt="item.name" class="w-full h-full object-cover" />
              <Headphones v-else class="w-16 h-16 text-foreground/80" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex">
                <h3 class="font-bold text-foreground text-lg mb-1 truncate">{{ item.name }} &nbsp;</h3>
                <div class="flex items-center gap-2">
                  <p class="text-xl font-bold text-foreground"> ~ ${{ (toNum(item.price)).toFixed(2) }}</p>
                </div>
              </div>
              <p class="text-sm text-muted-foreground mb-2">{{ item.type }}</p>
              <!-- Selected options -->
              <div v-if="selectedOptionsText(item)" class="text-sm items-center flex text-muted-foreground mb-2">
                {{ selectedOptionsText(item) }} <p v-if="optionSurcharge(item) > 0"
                  class="text-xs text-muted-foreground">&nbsp; (+${{
                    optionSurcharge(item).toFixed(2) }} options)</p>
              </div>
            </div>
            <button class="p-2 hover:bg-secondary rounded-lg transition-colors self-start"
              @click="$emit('removeFromCart', index)">
              <Trash2 class="w-5 h-5 text-muted-foreground hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="space-y-6 lg:col-span-2">
          <!-- Buyer Info -->
          <section class="bg-card rounded-2xl p-6 border border-border">
            <h2 class="text-xl font-bold text-foreground mb-4">{{ t('checkout.buyerInfo') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label for="buyer-name" class="text-sm text-muted-foreground">{{ t('checkout.name') }}</label>
                <input id="buyer-name" v-model="form.name" type="text"
                  class="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  :placeholder="t('checkout.namePlaceholder')" />
              </div>
              <div class="flex flex-col gap-2">
                <label for="buyer-phone" class="text-sm text-muted-foreground">{{ t('checkout.phone') }}</label>
                <input id="buyer-phone" v-model="form.phone" type="tel"
                  class="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  :placeholder="t('checkout.phonePlaceholder')" />
              </div>
            </div>
          </section>

          <!-- Delivery Address -->
          <section class="bg-card rounded-2xl p-6 border border-border">
            <h2 class="text-xl font-bold text-foreground mb-4">{{ t('checkout.delivery') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2 flex flex-col gap-2">
                <label for="full-address" class="text-sm text-muted-foreground">{{ t('checkout.fullAddress') }}</label>
                <input id="full-address" v-model="form.address" type="text"
                  class="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  :placeholder="t('checkout.addressPlaceholder')" />
              </div>
              <div class="flex flex-col gap-2">
                <label for="province" class="text-sm text-muted-foreground">{{ t('checkout.province') }}</label>
                <select id="province" v-model="form.province"
                  class="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="" disabled>{{ t('checkout.provincePlaceholder') }}</option>
                  <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <label for="note" class="text-sm text-muted-foreground">{{ t('checkout.note') }}</label>
                <input id="note" v-model="form.note" type="text"
                  class="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  :placeholder="t('checkout.notePlaceholder')" />
              </div>
            </div>
          </section>
        </div>

        <!-- Summary -->
        <div class="lg:col-span-1">
          <div class="bg-card rounded-2xl p-6 border border-border sticky top-24">
            <div class="space-y-3 mb-4">
              <!-- Itemized breakdown -->
              <div class="space-y-2 text-sm">
                <div v-for="(p, i) in cartItems" :key="'sum-' + i" class="">
                  <div class="flex justify-between text-foreground">
                    <span class="truncate mr-2">{{ p.name }}</span>
                    <span>${{ toNum(p.price).toFixed(2) }}</span>
                  </div>
                  <div class="pl-3 mt-1 space-y-1" v-if="optionEntries(p).length">
                    <div v-for="(op, j) in optionEntries(p)" :key="'sumop-' + i + '-' + j"
                      class="flex justify-between text-muted-foreground">
                      <span class="truncate mr-2">{{ op.key }}: {{ op.name }}</span>
                      <span v-if="op.price > 0">+${{ op.price.toFixed(2) }}</span>
                      <span v-else>$0.00</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Summary totals -->
              <div class="flex justify-between text-foreground">
                <span>{{ t('cart.shipping') }}</span>
                <span class="font-semibold">${{ shipping.toFixed(2) }}</span>
              </div>
              <div class="border-t border-border pt-3 flex justify-between text-foreground text-xl font-bold">
                <span>{{ t('cart.total') }}</span>
                <span>${{ total.toFixed(2) }}</span>
              </div>
            </div>

            <div class="space-y-4">
              <button type="button"
                class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-colors text-sm uppercase tracking-wide"
                @click="onCheckout">
                {{ isLoggedIn ? t('cart.checkout') : t('otp.payAndLogin') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- OTP Modal -->
    <OtpModal :open="showOtpModal" :phone="formatKhPhone(form.phone)" @close="showOtpModal = false"
      @verified="handleOtpVerified" />

    <!-- Payment Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="payModalOpen" class="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" />
          <div class="relative z-10 bg-card rounded-2xl p-5 border border-border w-full max-w-md">
            <button class="absolute top-3 right-3 p-2 rounded-lg hover:bg-secondary" @click="payModalOpen = false; stopPolling(); paymentMD5 = '';" aria-label="Close">
              <X class="w-4 h-4 text-muted-foreground" />
            </button>
            <h3 class="text-lg font-bold mb-2 text-foreground">Complete Payment</h3>
            <p class="text-sm text-muted-foreground">Scan the QR with your Bakong app or open the deeplink.</p>
            <p v-if="optionSummary" class="text-xs text-muted-foreground mt-1">{{ optionSummary }}</p>
            <div class="mt-3 flex flex-col items-center gap-3">
              <QrCode v-if="paymentQRString" :text="paymentQRString" :size="240" ref="qrRef" />
              
              <div class="w-full flex gap-2 mt-2">
                <button class="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground"
                  :disabled="!paymentDeeplink" @click="openDeeplink">Open in Bakong App</button>
                <button class="px-3 py-2 rounded-lg border border-border" @click="downloadQr">Download QR</button>
              </div>
              
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useApi } from '~/composables/useApi'
import { ShoppingCart, Headphones, Trash2, X } from 'lucide-vue-next'
import type { Product } from '~/types/product'
import { useI18n } from '~/composables/useI18n'
import OtpModal from '~/components/OtpModal.vue'
import { useNotify } from '~/composables/useNotify'
import { useCart } from '~/composables/useCart'
import QrCode from '~/components/QrCode.vue'

const props = defineProps<{
  cartItems: Product[]
}>()

defineEmits<{
  removeFromCart: [index: number]
}>()

const toNum = (v: any): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
const optionSurcharge = (p: Product): number => {
  const sel = (p as any)?.selectedOptions as Record<string, number> | undefined
  if (!sel) return 0
  const addons = parseAddons(p)
  let extra = 0
  for (const [key, idx] of Object.entries(sel)) {
    const arr = addons[key]
    if (Array.isArray(arr) && arr[idx]) {
      const add = Number((arr[idx] as any).price)
      extra += Number.isFinite(add) ? add : 0
    }
  }
  return extra
}
const baseSubtotal = computed(() => props.cartItems.reduce((sum, item) => sum + toNum(item.price), 0))
const optionsTotal = computed(() => props.cartItems.reduce((sum, item) => sum + optionSurcharge(item), 0))
const subtotal = computed(() => baseSubtotal.value + optionsTotal.value)

const shipping = computed(() => 1.5)

const total = computed(() => {
  return subtotal.value + shipping.value
})

// Build per-item breakdown for summary
function optionEntries(p: Product): { key: string; name: string; price: number }[] {
  const sel = (p as any)?.selectedOptions as Record<string, number> | undefined
  if (!sel) return []
  const addons = parseAddons(p)
  const out: { key: string; name: string; price: number }[] = []
  for (const [key, idx] of Object.entries(sel)) {
    const arr = addons[key]
    if (Array.isArray(arr) && arr[idx]) {
      const name = arr[idx].name || ''
      const price = toNum((arr[idx] as any).price)
      out.push({ key, name, price })
    }
  }
  return out
}

const { t } = useI18n()
const authState = useAuth()
const api = useApi()
const isLoggedIn = computed(() => !!authState.token.value)
const notify = useNotify()
const cart = useCart()

// Helpers for images and options
const runtimeConfig = useRuntimeConfig()
const apiBase = (runtimeConfig.public?.apiBase || '') as string
const toAbsolute = (src: string): string => {
  if (!src) return ''
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) return src
  const base = apiBase.replace(/\/$/, '')
  const path = src.replace(/^\//, '')
  return base ? `${base}/${path}` : `/${path}`
}
type AddonItem = { id?: number; name?: string; price?: number; image?: string | null }
function parseAddons(p: Product): Record<string, AddonItem[]> {
  const raw = (p as any)?.options
  const obj = typeof raw === 'string' ? safeParse(raw) : (raw || {})
  const addons = (obj?.addons || {}) as Record<string, AddonItem[]>
  return addons
}
function safeParse(s: string) {
  try { return JSON.parse(s) } catch { return {} }
}
function imageOf(p: Product): string {
  const sel = (p as any)?.selectedImage as string | undefined
  if (sel) return toAbsolute(sel)
  const firstLegacy = (p.images || [])[0]
  if (firstLegacy) return toAbsolute(firstLegacy)
  // Try from addons
  const addons = parseAddons(p)
  const first = Object.values(addons)
    .flatMap(arr => (Array.isArray(arr) ? arr : []) as AddonItem[])
    .map(it => it.image)
    .find(Boolean)
  return first ? toAbsolute(first as string) : ''
}
function selectedOptionsText(p: Product): string {
  const sel = (p as any)?.selectedOptions as Record<string, number> | undefined
  if (!sel) return ''
  const addons = parseAddons(p)
  const parts: string[] = []
  for (const [key, idx] of Object.entries(sel)) {
    const arr = addons[key]
    const name = Array.isArray(arr) && arr[idx] ? arr[idx].name || '' : ''
    if (name) parts.push(`${key}: ${name}`)
  }
  return parts.join(', ')
}

const form = ref({
  name: '',
  phone: '',
  address: '',
  province: '',
  note: '',
})

const provinces = [
  'Banteay Meanchey', 'Battambang', 'Kampong Cham', 'Kampong Chhnang',
  'Kampong Speu', 'Kampong Thom', 'Kampot', 'Kandal', 'Kep', 'Koh Kong',
  'Kratié', 'Mondulkiri', 'Oddar Meanchey', 'Pailin', 'Preah Sihanouk',
  'Preah Vihear', 'Pursat', 'Prey Veng', 'Ratanakiri', 'Siem Reap',
  'Stung Treng', 'Svay Rieng', 'Takeo', 'Tbong Khmum',
]

const showOtpModal = ref(false)

const onCheckout = async () => {
  if (!form.value.name || !form.value.phone || !form.value.address || !form.value.province) {
    notify.warning(t('checkout.fillRequired'))
    return
  }
  if (!isLoggedIn.value) {
    showOtpModal.value = true
    return
  } else {
    await upsertUserProfile()
    await startPaymentFlow()
  }
}

const formatKhPhone = (raw: string) => {
  const s = (raw || '').replace(/\s+/g, '')
  if (!s) return ''
  if (s.startsWith('+')) return s
  if (s.startsWith('0')) return '+855' + s.slice(1)
  return '+855' + s
}

const handleOtpVerified = async (token: string) => {
  if (token) {
    authState.setToken(token)
  }
  await upsertUserProfile()
  notify.success(t('otp.verified'))
  await startPaymentFlow()
  showOtpModal.value = false
}

// Payment modal state
const payModalOpen = ref(false)
const paymentLink = ref('')
const paymentQRString = ref('')
const paymentDeeplink = ref('')
const paymentMD5 = ref('')
const optionSummary = ref('')
const paymentStatus = ref<'idle' | 'pending' | 'success' | 'failed'>('idle')
let pollTimer: any = null

// Build checkout payload for new secure flow (single product)
const buildCheckoutPayload = () => {
  if (!props.cartItems.length) return null
  // Use the first product in cart; quantity is count of that product id
  const primary: Product | undefined = props.cartItems[0]
  if (!primary) return null
  const qty = props.cartItems.filter(p => p.id === primary.id).length
  const selections: Record<string, string> = {}
  // Map selectedOptions indices to names
  const selIdx = (primary as any).selectedOptions as Record<string, number> | undefined
  if (selIdx) {
    const addons = parseAddons(primary as Product)
    for (const [key, idx] of Object.entries(selIdx)) {
      const arr = addons[key]
      const name = Array.isArray(arr) && arr[idx] ? (arr[idx].name || '') : ''
      if (name) {
        const titled = key.replace(/(^|_|-)([a-z])/g, (_, __, c) => ' ' + c.toUpperCase()).trim()
        selections[titled || key] = name
      }
    }
  }
  const profilePhone = (authState.profile.value as any)?.phone_number as string | undefined
  const userPhone = formatKhPhone(profilePhone || form.value.phone)
  const userInfo = `${form.value.name}, ${userPhone}, ${form.value.address}, ${form.value.province}`
  return {
    product_id: (primary as Product).id,
    quantity: qty,
    selections,
    user_info: userInfo,
    user_phone_number: userPhone,
    note: form.value.note || ''
  }
}

const startPaymentFlow = async () => {
  // New secure flow: checkout initiation (no DB write yet)
  const payload = buildCheckoutPayload()
  if (!payload) { notify.error('Cart is empty'); return }
  const initRes = await api.post('/orders/checkout/bakong', payload)
  if (!initRes.ok) {
    notify.error('Failed to initiate payment')
    return
  }
  const initData = await initRes.json().catch(() => null as any)
  // Expect: { payment: { md5, deeplink, qr_string }, unit_price, total_price, currency, option_summary }
  const pay = initData?.payment || initData || {}
  paymentQRString.value = String(pay?.qr_string || '')
  paymentDeeplink.value = String(pay?.deeplink || '')
  paymentMD5.value = String(pay?.md5 || '')
  const first: Product | undefined = props.cartItems[0]
  optionSummary.value = String(initData?.option_summary || (first ? selectedOptionsText(first as Product) : '') || '')
  paymentLink.value = paymentDeeplink.value || ''
  payModalOpen.value = true
  paymentStatus.value = 'pending'
  startPollingStatus()
}

const startPollingStatus = () => {
  stopPolling()
  const start = Date.now()
  pollTimer = setInterval(async () => {
    if (!paymentMD5.value) return
    try {
      // Optional status poll
      const url = new URL(api.url('/orders/payment/bakong/status'))
      url.searchParams.set('md5', paymentMD5.value)
      const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
      if (res.ok) {
        const data = await res.json().catch(() => null as any)
        const val = String(data?.payment_status || '').toLowerCase()
        if (val.includes('success') || val.includes('paid')) {
          paymentStatus.value = 'success'
        }
      }
    } catch {}

    // Always try confirm; backend returns 202 until paid
    const result = await confirmOrder()
    if (result === 'confirmed') {
      stopPolling()
      payModalOpen.value = false
      return
    }

    // timeout after 3 minutes
    if (Date.now() - start > 3 * 60 * 1000) {
      paymentStatus.value = 'failed'
      notify.error('Payment timeout')
      stopPolling()
      payModalOpen.value = false
      paymentMD5.value = ''
    }
  }, 3000)
}
const stopPolling = () => { if (pollTimer) { clearInterval(pollTimer); pollTimer = null } }
const confirmOrder = async (): Promise<'confirmed'|'pending'|'error'> => {
  const payload = buildCheckoutPayload()
  if (!payload || !paymentMD5.value) return 'error'
  const body = { ...payload, md5: paymentMD5.value }
  const res = await api.post('/orders/confirm/bakong', body)
  if (res.status === 202) {
    // Not yet paid
    return 'pending'
  }
  if (res.ok) {
    notify.success('Order confirmed')
    cart.clear()
    return 'confirmed'
  }
  return 'error'
}

const qrRef = ref<any>(null)
const downloadQr = () => {
  const url = qrRef.value?.toDataURL?.() || ''
  if (!url) return
  const a = document.createElement('a')
  a.href = url
  a.download = `bakong-qr-${paymentMD5.value || Date.now()}.png`
  document.body.appendChild(a)
  a.click()
  a.remove()
}
const openDeeplink = () => {
  if (!paymentDeeplink.value) return
  window.open(paymentDeeplink.value, '_blank', 'noopener')
}

const fetchMe = async () => {
  try {
    const res = await api.get('/user/me')
    if (!res.ok) return
    const me = await res.json()
    authState.setProfile(me)
    form.value.name = me.full_name || ''
    form.value.phone = me.phone_number || ''
    form.value.address = me.address || ''
    form.value.province = me.province || ''
  } catch (e) {
    console.error(e)
  }
}

const upsertUserProfile = async () => {
  try {
    const body = {
      full_name: form.value.name,
      phone_number: formatKhPhone(form.value.phone),
      address: form.value.address,
      province: form.value.province,
      note: form.value.note,
    }
    const res = await api.post('/user/me', body, { method: 'PUT' })
    if (!res.ok) return
    const updated = await res.json()
    authState.setProfile(updated)
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  authState.loadFromStorage()
  if (isLoggedIn.value) {
    fetchMe()
  }
})
</script>
