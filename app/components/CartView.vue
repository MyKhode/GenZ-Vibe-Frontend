<template>
  <div>
    <h1 class="font-display text-4xl lg:text-5xl font-bold text-foreground mb-8">
      {{ t('cart.title') }}
    </h1>

    <div v-if="cartItems.length === 0" class="text-center py-16">
      <ShoppingCart class="w-24 h-24 text-muted-foreground mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-foreground mb-2">{{ t('cart.empty') }}</h2>
      <p class="text-muted-foreground mb-6">{{ t('cart.emptyCta') }}</p>
    </div>

    <div v-else>
      <div class="space-y-4 mb-8">
        <div 
          v-for="(item, index) in cartItems" 
          :key="index"
          class="bg-card rounded-2xl p-4 lg:p-6 border border-border"
        >
          <div class="flex gap-4">
            <div class="w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-border bg-secondary">
              <img v-if="item.images && item.images.length" :src="item.images[0]" :alt="item.name" class="w-full h-full object-cover" />
              <Headphones v-else class="w-16 h-16 text-foreground/80" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-foreground text-lg mb-1 truncate">{{ item.name }}</h3>
              <p class="text-sm text-muted-foreground mb-2">{{ item.type }}</p>
              <p class="text-xl font-bold text-foreground">${{ item.price.toFixed(2) }}</p>
            </div>
            <button 
              class="p-2 hover:bg-secondary rounded-lg transition-colors self-start"
              @click="$emit('removeFromCart', index)"
            >
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
                <input id="buyer-name" v-model="form.name" type="text" class="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" :placeholder="t('checkout.namePlaceholder')" />
              </div>
              <div class="flex flex-col gap-2">
                <label for="buyer-phone" class="text-sm text-muted-foreground">{{ t('checkout.phone') }}</label>
                <input id="buyer-phone" v-model="form.phone" type="tel" class="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" :placeholder="t('checkout.phonePlaceholder')" />
              </div>
            </div>
          </section>

          <!-- Delivery Address -->
          <section class="bg-card rounded-2xl p-6 border border-border">
            <h2 class="text-xl font-bold text-foreground mb-4">{{ t('checkout.delivery') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2 flex flex-col gap-2">
                <label for="full-address" class="text-sm text-muted-foreground">{{ t('checkout.fullAddress') }}</label>
                <input id="full-address" v-model="form.address" type="text" class="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" :placeholder="t('checkout.addressPlaceholder')" />
              </div>
              <div class="flex flex-col gap-2">
                <label for="province" class="text-sm text-muted-foreground">{{ t('checkout.province') }}</label>
                <select id="province" v-model="form.province" class="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="" disabled>{{ t('checkout.provincePlaceholder') }}</option>
                  <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <label for="note" class="text-sm text-muted-foreground">{{ t('checkout.note') }}</label>
                <input id="note" v-model="form.note" type="text" class="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" :placeholder="t('checkout.notePlaceholder')" />
              </div>
            </div>
          </section>
        </div>

        <!-- Summary -->
        <div class="lg:col-span-1">
          <div class="bg-card rounded-2xl p-6 border border-border sticky top-24">
            <div class="space-y-3 mb-4">
              <div class="flex justify-between text-foreground">
                <span>{{ t('cart.subtotal') }}</span>
                <span class="font-semibold">${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-foreground">
                <span>{{ t('cart.shipping') }}</span>
                <span class="font-semibold">$10.00</span>
              </div>
              <div class="flex justify-between text-foreground">
                <span>{{ t('cart.tax') }}</span>
                <span class="font-semibold">${{ tax.toFixed(2) }}</span>
              </div>
              <div class="border-t border-border pt-3 flex justify-between text-foreground text-xl font-bold">
                <span>{{ t('cart.total') }}</span>
                <span>${{ total.toFixed(2) }}</span>
              </div>
            </div>
            
            <div class="space-y-4">
              <button 
                type="button"
                class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-colors text-sm uppercase tracking-wide"
                @click="onCheckout"
              >
                {{ isLoggedIn ? t('cart.checkout') : t('otp.payAndLogin') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- OTP Modal -->
    <OtpModal 
      :open="showOtpModal" 
      :phone="formatKhPhone(form.phone)" 
      @close="showOtpModal = false" 
      @verified="handleOtpVerified" 
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useApi } from '~/composables/useApi'
import { ShoppingCart, Headphones, Trash2 } from 'lucide-vue-next'
import type { Product } from '~/types/product'
import { useI18n } from '~/composables/useI18n'
import OtpModal from '~/components/OtpModal.vue'

const props = defineProps<{
  cartItems: Product[]
}>()

defineEmits<{
  removeFromCart: [index: number]
}>()

const subtotal = computed(() => {
  return props.cartItems.reduce((sum, item) => sum + item.price, 0)
})

const tax = computed(() => {
  return subtotal.value * 0.08
})

const total = computed(() => {
  return subtotal.value + 10 + tax.value
})

const { t } = useI18n()
const authState = useAuth()
const api = useApi()
const isLoggedIn = computed(() => !!authState.token.value)

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
    alert(t('checkout.fillRequired'))
    return
  }
  if (!isLoggedIn.value) {
    showOtpModal.value = true
    return
  } else {
    await upsertUserProfile()
    await saveOrder()
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
  alert(t('otp.verified'))
  await saveOrder()
  showOtpModal.value = false
}

const saveOrder = async () => {
  try {
    const userInfo = `${form.value.name}, ${form.value.phone}, ${form.value.address}, ${form.value.province}`
    const payload = {
      product_name: props.cartItems.map((p) => p.name).join(', '),
      product_option: props.cartItems.map((p) => (p.options ? p.options[0] : 'Standard')).join(', '),
      quantity: props.cartItems.length,
      price: total.value.toFixed(2),
      user_info: userInfo,
      note: form.value.note,
    }
    const res = await api.post('/orders/', payload)
    if (!res.ok) throw new Error('Order save failed')
    alert('✅ Order successfully submitted!')
  } catch (e) {
    console.error(e)
    alert('❌ Failed to submit order.')
  }
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
