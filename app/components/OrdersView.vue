<template>
  <div>
    <h1 class="font-display text-4xl lg:text-5xl font-bold text-foreground mb-8">
      Order <span class="text-primary">History</span>
    </h1>

    <div v-if="orders.length === 0" class="text-center py-16">
      <Package class="w-24 h-24 text-muted-foreground mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-foreground mb-2">No orders yet</h2>
      <p class="text-muted-foreground mb-6">Your order history will appear here</p>
    </div>

    <div v-else class="space-y-6">
      <div 
        v-for="order in orders" 
        :key="order.id"
        class="bg-card rounded-2xl p-6 border border-border"
      >
        <!-- Order Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
          <div>
            <h3 class="font-bold text-foreground text-lg mb-1">Order #{{ order.id }}</h3>
            <p class="text-sm text-muted-foreground">{{ order.date }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span 
              class="px-4 py-2 rounded-full text-sm font-semibold"
              :class="getStatusClass(order.status)"
            >
              {{ order.status }}
            </span>
          </div>
        </div>

        <!-- Order Items -->
        <div class="space-y-4 mb-4">
          <div 
            v-for="item in order.items" 
            :key="item.id"
            class="flex gap-4"
          >
            <div class="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
              <Headphones class="w-12 h-12 text-foreground/80" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-foreground truncate">{{ item.name }}</h4>
              <p class="text-sm text-muted-foreground">Quantity: {{ item.quantity }}</p>
              <p class="text-sm font-semibold text-foreground">${{ item.price.toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <!-- Order Total -->
        <div class="pt-4 border-t border-border flex justify-between items-center">
          <span class="text-foreground font-semibold">Total</span>
          <span class="text-xl font-bold text-foreground">${{ order.total.toFixed(2) }}</span>
        </div>

        <!-- Order Actions -->
        <div class="flex gap-3 mt-4">
          <button class="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 rounded-xl transition-colors text-sm">
            Track Order
          </button>
          <button class="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-colors text-sm">
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Package, Headphones } from 'lucide-vue-next'

interface OrderItem {
  id: number
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  date: string
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  items: OrderItem[]
  total: number
}

const orders = ref<Order[]>([
  {
    id: '10234',
    date: 'October 20, 2025',
    status: 'Delivered',
    items: [
      { id: 1, name: 'G522 Lightspeed', quantity: 1, price: 169.99 }
    ],
    total: 189.99
  },
  {
    id: '10233',
    date: 'October 15, 2025',
    status: 'Shipped',
    items: [
      { id: 2, name: 'G733 Lightspeed', quantity: 2, price: 119.00 }
    ],
    total: 258.00
  }
])

const getStatusClass = (status: Order['status']) => {
  switch (status) {
    case 'Processing':
      return 'bg-yellow-500/20 text-yellow-500'
    case 'Shipped':
      return 'bg-blue-500/20 text-blue-500'
    case 'Delivered':
      return 'bg-green-500/20 text-green-500'
    case 'Cancelled':
      return 'bg-red-500/20 text-red-500'
    default:
      return 'bg-gray-500/20 text-gray-500'
  }
}
</script>