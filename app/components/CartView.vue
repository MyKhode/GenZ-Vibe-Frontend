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
            <!-- Product Image -->
            <div class="w-24 h-24 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
              <Headphones class="w-16 h-16 text-foreground/80" />
            </div>

            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-foreground text-lg mb-1 truncate">{{ item.name }}</h3>
              <p class="text-sm text-muted-foreground mb-2">{{ item.type }}</p>
              
              <p class="text-xl font-bold text-foreground">${{ item.price.toFixed(2) }}</p>
            </div>

            <!-- Remove Button -->
            <button 
              class="p-2 hover:bg-secondary rounded-lg transition-colors self-start"
              @click="$emit('removeFromCart', index)"
            >
              <Trash2 class="w-5 h-5 text-muted-foreground hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      <!-- Checkout Details -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Buyer + Delivery + Payment -->
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

          <!-- Payment Method -->
          <section class="bg-card rounded-2xl p-6 border border-border">
            <h2 class="text-xl font-bold text-foreground mb-4">{{ t('checkout.payment') }}</h2>
            <div class="space-y-4">
              <label class="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-secondary">
                <input type="radio" class="accent-primary" value="khqr" v-model="form.paymentMethod" />
                <div class="flex flex-col">
                  <span class="font-medium text-foreground">{{ t('checkout.bakongKhqr') }}</span>
                  <span class="text-sm text-muted-foreground">{{ t('checkout.khqrDesc') }}</span>
                </div>
              </label>
              <div v-if="form.paymentMethod === 'khqr'" class="mt-2 p-4 rounded-lg border border-dashed border-border bg-background/50">
                <p class="text-sm text-muted-foreground">{{ t('checkout.khqrNote') }}</p>
                <!-- Placeholder for KHQR image/QR generation in future -->
                <div class="mt-3 h-40 rounded-md bg-secondary flex items-center justify-center text-muted-foreground text-sm">
                  {{ t('checkout.khqrPlaceholder') }}
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Summary -->
        <div class="lg:col-span-1">
          <!-- Cart Summary -->
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
            
            <button 
              class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-colors text-sm uppercase tracking-wide"
              @click="onCheckout"
            >
              {{ t('cart.checkout') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ShoppingCart, Headphones, Trash2 } from 'lucide-vue-next'
import type { Product } from '~/types/product'
import { useI18n } from '~/composables/useI18n'

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
  return subtotal.value * 0.08 // 8% tax
})

const total = computed(() => {
  return subtotal.value + 10 + tax.value // +10 for shipping
})
const { t } = useI18n()

// Simple form model
const form = ref({
  name: '',
  phone: '',
  address: '',
  province: '',
  note: '',
  paymentMethod: 'khqr' as 'khqr',
})

// Cambodia provinces (24 provinces, excluding Phnom Penh)
const provinces = [
  'Banteay Meanchey',
  'Battambang',
  'Kampong Cham',
  'Kampong Chhnang',
  'Kampong Speu',
  'Kampong Thom',
  'Kampot',
  'Kandal',
  'Kep',
  'Koh Kong',
  'Kratié',
  'Mondulkiri',
  'Oddar Meanchey',
  'Pailin',
  'Preah Sihanouk',
  'Preah Vihear',
  'Pursat',
  'Prey Veng',
  'Ratanakiri',
  'Siem Reap',
  'Stung Treng',
  'Svay Rieng',
  'Takeo',
  'Tbong Khmum',
]

const onCheckout = () => {
  // Minimal front-end validation
  if (!form.value.name || !form.value.phone || !form.value.address || !form.value.province) {
    alert(t('checkout.fillRequired'))
    return
  }
  // Placeholder action
  alert(t('checkout.submitted'))
}
</script>
