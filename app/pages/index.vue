<template>
  <div class="min-h-screen pb-24 lg:pb-8">
    <!-- Mobile/Desktop Header -->
    <div class="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
      <div class="container mx-auto max-w-7xl px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Headphones class="w-6 h-6 text-primary-foreground" />
            </div>
            <div class="hidden sm:block">
              <h1 class="font-display text-xl font-bold text-foreground">PEAK AUDIO</h1>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button 
              class="p-2 hover:bg-secondary rounded-lg transition-colors"
              @click="toggleSearch"
            >
              <Search class="w-5 h-5 text-muted-foreground" />
            </button>
            <button 
              class="p-2 hover:bg-secondary rounded-lg transition-colors"
              @click="showFilters = true"
            >
              <SlidersHorizontal class="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <Transition name="search">
          <div v-if="isSearchOpen" class="mt-4">
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search products..."
              class="w-full px-4 py-2 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              @keyup.escape="isSearchOpen = false"
            />
          </div>
        </Transition>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto max-w-7xl px-4 py-6 lg:py-8">
      <!-- Current View -->
      <component 
        :is="currentViewComponent"
        :products="filteredProducts"
        :cart-items="cartItems"
        @select-product="handleSelectProduct"
        @remove-from-cart="handleRemoveFromCart"
      />
    </div>

    <!-- Bottom Navigation (Mobile) -->
    <div class="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border">
      <div class="flex items-center justify-around py-3 px-4">
        <button 
          class="flex flex-col items-center gap-1 p-2 transition-colors"
          :class="currentView === 'home' ? 'text-primary' : 'text-muted-foreground'"
          @click="currentView = 'home'"
        >
          <Home class="w-5 h-5" />
          <span class="text-xs font-medium">Home</span>
        </button>
        
        <button 
          class="flex flex-col items-center gap-1 p-2 transition-colors relative"
          :class="currentView === 'cart' ? 'text-primary' : 'text-muted-foreground'"
          @click="currentView = 'cart'"
        >
          <ShoppingCart class="w-5 h-5" />
          <span class="text-xs font-medium">Cart</span>
          <span 
            v-if="cartItems.length > 0"
            class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center"
          >
            {{ cartItems.length }}
          </span>
        </button>
        
        <button 
          class="flex flex-col items-center gap-1 p-2 transition-colors"
          :class="currentView === 'orders' ? 'text-primary' : 'text-muted-foreground'"
          @click="currentView = 'orders'"
        >
          <FileText class="w-5 h-5" />
          <span class="text-xs font-medium">Orders</span>
        </button>
        
        <button 
          class="flex flex-col items-center gap-1 p-2 transition-colors"
          :class="currentView === 'contact' ? 'text-primary' : 'text-muted-foreground'"
          @click="currentView = 'contact'"
        >
          <Mail class="w-5 h-5" />
          <span class="text-xs font-medium">Contact</span>
        </button>
      </div>
    </div>

    <!-- Desktop Navigation -->
    <div class="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-40">
      <div class="flex flex-col gap-4 bg-card border border-border rounded-2xl p-4">
        <button 
          class="p-3 rounded-lg transition-colors relative"
          :class="currentView === 'home' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'"
          @click="currentView = 'home'"
          title="Home"
        >
          <Home class="w-5 h-5" />
        </button>
        
        <button 
          class="p-3 rounded-lg transition-colors relative"
          :class="currentView === 'cart' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'"
          @click="currentView = 'cart'"
          title="Cart"
        >
          <ShoppingCart class="w-5 h-5" />
          <span 
            v-if="cartItems.length > 0"
            class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center"
          >
            {{ cartItems.length }}
          </span>
        </button>
        
        <button 
          class="p-3 rounded-lg transition-colors"
          :class="currentView === 'orders' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'"
          @click="currentView = 'orders'"
          title="Orders"
        >
          <FileText class="w-5 h-5" />
        </button>
        
        <button 
          class="p-3 rounded-lg transition-colors"
          :class="currentView === 'contact' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'"
          @click="currentView = 'contact'"
          title="Contact"
        >
          <Mail class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Product Detail Modal -->
    <ProductModal 
      v-if="selectedProduct"
      :product="selectedProduct"
      :is-open="showProductModal"
      @close="showProductModal = false"
      @add-to-cart="handleAddToCart"
      @buy-now="handleBuyNow"
    />

    <!-- Filter Modal -->
    <FilterModal 
      :is-open="showFilters"
      :filters="filters"
      @close="showFilters = false"
      @apply="handleApplyFilters"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Headphones, Search, SlidersHorizontal, Home, ShoppingCart, FileText, Mail } from 'lucide-vue-next'
import type { Product } from '~/types/product'
import HomeView from '~/components/HomeView.vue'
import CartView from '~/components/CartView.vue'
import OrdersView from '~/components/OrdersView.vue'
import ContactView from '~/components/ContactView.vue'

const products = ref<Product[]>([
  {
    id: 1,
    name: 'G522 Lightspeed',
    type: 'Wireless',
    price: 169.99,
    rating: 5,
    image: '/images/headset-white.png',
    colors: ['white', 'pink', 'yellow'],
    microphone: 'Flip-to-mute',
    description: 'Play like a legend with a headset designed for performance PC gaming. Immersive HQ audio, the best mic in gaming, and sleek side-facing!',
    features: [
      'Wireless connectivity',
      'Flip-to-mute microphone',
      'Premium audio quality',
      'Comfortable design'
    ]
  },
  {
    id: 2,
    name: 'G733 Lightspeed',
    type: 'Wireless',
    price: 119.00,
    rating: 5,
    image: '/images/headset-blue.png',
    colors: ['blue', 'white'],
    microphone: 'Flip-to-mute',
    description: 'Lightweight wireless gaming headset with advanced audio and customizable LIGHTSYNC RGB lighting.',
    features: [
      'Ultra-lightweight design',
      'LIGHTSYNC RGB',
      'Pro-G drivers',
      '29-hour battery life'
    ]
  }
])

const currentView = ref<'home' | 'cart' | 'orders' | 'contact'>('home')
const selectedProduct = ref<Product | null>(null)
const showProductModal = ref(false)
const showFilters = ref(false)
const isSearchOpen = ref(false)
const searchQuery = ref('')
const cartItems = ref<Product[]>([])

const filters = ref({
  types: [] as string[],
  priceRange: 'all',
  ratings: [] as number[]
})

const currentViewComponent = computed(() => {
  switch (currentView.value) {
    case 'home': return HomeView
    case 'cart': return CartView
    case 'orders': return OrdersView
    case 'contact': return ContactView
    default: return HomeView
  }
})

const filteredProducts = computed(() => {
  let result = products.value

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.type.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    )
  }

  // Type filter
  if (filters.value.types.length > 0) {
    result = result.filter(p => filters.value.types.includes(p.type))
  }

  // Price filter
  if (filters.value.priceRange !== 'all') {
    result = result.filter(p => {
      switch (filters.value.priceRange) {
        case 'under100': return p.price < 100
        case '100-200': return p.price >= 100 && p.price <= 200
        case 'over200': return p.price > 200
        default: return true
      }
    })
  }

  // Rating filter
  if (filters.value.ratings.length > 0) {
    result = result.filter(p => filters.value.ratings.includes(p.rating))
  }

  return result
})

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value
  if (!isSearchOpen.value) {
    searchQuery.value = ''
  }
}

const handleSelectProduct = (product: Product) => {
  selectedProduct.value = product
  showProductModal.value = true
}

const handleAddToCart = (product: Product) => {
  cartItems.value.push(product)
  showProductModal.value = false
}

const handleBuyNow = (product: Product) => {
  cartItems.value = [product]
  currentView.value = 'cart'
  showProductModal.value = false
}

const handleRemoveFromCart = (index: number) => {
  cartItems.value.splice(index, 1)
}

const handleApplyFilters = (newFilters: typeof filters.value) => {
  filters.value = newFilters
}
</script>

<style scoped>
.search-enter-active,
.search-leave-active {
  transition: all 0.3s ease;
}

.search-enter-from,
.search-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>