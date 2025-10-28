<template>
  <header class="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
    <div class="container mx-auto max-w-7xl px-4 py-4">
      <div class="flex items-center gap-4">
        <!-- Logo / Brand -->
        <NuxtLink to="/" class="flex items-center gap-3 shrink-0" aria-label="Peak Audio Home">
          <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Headphones class="w-6 h-6 text-primary-foreground" />
          </div>
          <div class="hidden sm:block">
            <span class="font-display text-xl font-bold text-foreground">GenZ Vibe</span>
          </div>
        </NuxtLink>

        <!-- Center Search -->
        <div ref="searchRef" class="relative flex-1">
          <input
            v-model="searchInput"
            type="search"
            :placeholder="t('header.search')"
            class="w-full pl-4 pr-12 py-2 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            @focus="showSuggestions = true"
            @keydown.down.prevent="moveHighlight(1)"
            @keydown.up.prevent="moveHighlight(-1)"
            @keydown.enter.prevent="handleEnter"
            @keydown.esc="showSuggestions = false"
            aria-label="Search products"
          />
          <button
            class="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-secondary/80 text-muted-foreground"
            @click="commitSearch"
            :title="t('header.search')"
            type="button"
          >
            <Search class="w-5 h-5" />
          </button>

          <!-- Suggestions Dropdown -->
          <Transition name="fade-y">
            <div
              v-if="showSuggestions && searchInput.trim().length > 0"
              class="absolute left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
            >
              <ul class="max-h-64 overflow-auto" role="listbox">
                <li
                  v-for="(s, index) in suggestions"
                  :key="s.id"
                  role="option"
                  :aria-selected="index === highlightIndex"
                  :class="[
                    'px-4 py-2 cursor-pointer text-sm text-foreground',
                    index === highlightIndex ? 'bg-secondary' : 'hover:bg-secondary'
                  ]"
                  @mouseenter="highlightIndex = index"
                  @mousedown.prevent="selectSuggestion(index)"
                >
                  {{ s.name }}
                </li>
                <li v-if="suggestions.length === 0" class="px-4 py-2 text-sm text-muted-foreground">{{ t('search.noSuggestions') }}</li>
              </ul>
            </div>
          </Transition>
        </div>

        <!-- More Menu -->
        <div class="relative flex items-center gap-2 shrink-0" ref="moreRef">
          <button 
            class="p-2 hover:bg-secondary rounded-lg transition-colors inline-flex items-center gap-2 text-foreground border border-border"
            @click="toggleMore"
            :title="t('header.more')"
            type="button"
          >
            <PanelTopOpen class="w-5 h-5 text-muted-foreground" />
          </button>

          <Transition name="fade-scale">
            <div 
              v-if="showMore"
              class="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
            >
              <div class="px-3 py-2 text-xs uppercase text-muted-foreground">{{ t('menu.language') }}</div>
              <div class="px-2 pb-2 flex items-center gap-2">
                <button 
                  class="flex-1 px-3 py-1.5 rounded-md border text-sm"
                  :class="locale === 'en' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border'"
                  @click="setLocale('en')"
                >{{ t('menu.eng') }}</button>
                <button 
                  class="flex-1 px-3 py-1.5 rounded-md border text-sm"
                  :class="locale === 'km' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border'"
                  @click="setLocale('km')"
                >{{ t('menu.kh') }}</button>
              </div>
              <div class="h-px bg-border" />
              <button class="w-full text-left px-4 py-2 hover:bg-secondary text-sm" @click="openFilters">{{ t('menu.filter') }}</button>
              <NuxtLink class="block px-4 py-2 hover:bg-secondary text-sm" to="/contact" @click="showMore=false">{{ t('menu.contact') }}</NuxtLink>
              <NuxtLink class="block px-4 py-2 hover:bg-secondary text-sm" to="/partners" @click="showMore=false">{{ t('menu.partners') }}</NuxtLink>
              <div class="h-px bg-border" />
              <!-- Auth area: login when logged out; account/logout when logged in -->
              <div v-if="!isLoggedIn" class="p-3 space-y-2">
                <label class="block text-xs uppercase text-muted-foreground">Login</label>
                <input v-model="loginPhone" type="tel" class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="+855 12 345 678" />
                <button class="w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60" :disabled="!loginPhone.trim()" @click="openOtp()">Send Code</button>
              </div>
              <div v-else class="p-2">
                <div class="px-3 py-2 text-xs uppercase text-muted-foreground">Account</div>
                <button class="w-full text-left px-4 py-2 hover:bg-secondary text-sm" @click="openAccount">Manage Account</button>
                <button class="w-full text-left px-4 py-2 hover:bg-secondary text-sm text-red-500" @click="logout">Logout</button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
    <!-- Modals -->
    <OtpModal :open="showOtp" :phone="formatKhPhone(loginPhone)" @close="showOtp=false" @verified="handleOtpVerified" />
    <AccountModal :open="showAccount" @close="showAccount=false" @saved="showAccount=false" />
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Headphones, Search, PanelTopOpen } from 'lucide-vue-next'
import type { Product } from '~/types/product'
import { fetchProducts } from '~/services/products'
import { useUiState } from '~/composables/useUiState'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '~/composables/useAuth'
import { useApi } from '~/composables/useApi'
import OtpModal from '~/components/OtpModal.vue'
import AccountModal from '~/components/AccountModal.vue'

const router = useRouter()
const route = useRoute()
const ui = useUiState()
const { t, setLocale, locale } = useI18n()
const auth = useAuth()
const api = useApi()

const searchInput = ref<string>((route.query.q as string) || '')
const showSuggestions = ref(false)
const searchRef = ref<HTMLElement | null>(null)
const highlightIndex = ref(-1)
const showMore = ref(false)
const moreRef = ref<HTMLElement | null>(null)
const isLoggedIn = computed(() => !!auth.token.value)
const loginPhone = ref('')
const showOtp = ref(false)
const showAccount = ref(false)

const allProducts = ref<Product[]>([])
const suggestions = computed(() => {
  const q = searchInput.value.trim().toLowerCase()
  if (!q) return [] as Product[]
  const unique = new Map<number, Product>()
  for (const p of allProducts.value) {
    if (
      p.name.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    ) {
      unique.set(p.id, p)
    }
  }
  return Array.from(unique.values()).slice(0, 8)
})

const loadAll = async () => {
  try {
    const items = await fetchProducts({})
    allProducts.value = items
  } catch {}
}

const commitSearch = async () => {
  showSuggestions.value = false
  highlightIndex.value = -1
  router.push({ path: '/', query: { q: searchInput.value.trim() || undefined } })
}

const selectSuggestion = (idx: number) => {
  const s = suggestions.value[idx]
  if (!s) return
  searchInput.value = s.name
  commitSearch()
}

const moveHighlight = (delta: number) => {
  const len = suggestions.value.length
  if (len === 0) return
  let next = highlightIndex.value + delta
  if (next < 0) next = len - 1
  if (next >= len) next = 0
  highlightIndex.value = next
  showSuggestions.value = true
}

const handleEnter = () => {
  if (showSuggestions.value && highlightIndex.value >= 0) {
    selectSuggestion(highlightIndex.value)
  } else {
    commitSearch()
  }
}

const handleClickOutside = (e: MouseEvent) => {
  const el = searchRef.value
  const moreEl = moreRef.value
  if (el && !el.contains(e.target as Node)) {
    showSuggestions.value = false
  }
  if (moreEl && !moreEl.contains(e.target as Node)) {
    showMore.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadAll()
  auth.loadFromStorage()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const toggleMore = () => {
  showMore.value = !showMore.value
}

const openFilters = () => {
  showMore.value = false
  if (route.path !== '/') {
    router.push({ path: '/', query: { ...route.query, openFilters: '1' } })
    return
  }
  ui.showFilters.value = true
}

const formatKhPhone = (raw: string) => {
  const s = (raw || '').replace(/\s+/g, '')
  if (!s) return ''
  if (s.startsWith('+')) return s
  if (s.startsWith('0')) return '+855' + s.slice(1)
  return '+855' + s
}

const openOtp = () => {
  if (!loginPhone.value.trim()) return
  showMore.value = false
  showOtp.value = true
}

const handleOtpVerified = async (token: string) => {
  if (token) auth.setToken(token)
  try {
    const res = await api.get('/user/me')
    if (res.ok) {
      const me = await res.json()
      auth.setProfile(me)
    }
  } catch {}
  showOtp.value = false
}

const openAccount = () => {
  showMore.value = false
  showAccount.value = true
}

const logout = () => {
  auth.setToken(null)
  auth.setProfile(null)
  showMore.value = false
}
</script>

<style scoped>
/* Quick, subtle fades */
.fade-scale-enter-active, .fade-scale-leave-active { transition: all .12s ease-out; }
.fade-scale-enter-from, .fade-scale-leave-to { opacity: 0; transform: translateY(4px) scale(0.98); }

.fade-y-enter-active, .fade-y-leave-active { transition: all .12s ease-out; }
.fade-y-enter-from, .fade-y-leave-to { opacity: 0; transform: translateY(6px); }
</style>
