<template>
  <section>
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-semibold text-foreground">Products</h2>
      <button class="px-3 py-2 rounded-lg bg-primary text-primary-foreground" @click="openCreate">Create Product</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="prod in products" :key="prod.id" class="bg-card border border-border rounded-2xl p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-foreground">{{ prod.name }}</h3>
          <span class="text-sm text-muted-foreground">ID: {{ prod.id }}</span>
        </div>
        <p class="text-sm text-muted-foreground mb-2 truncate">{{ prod.description }}</p>
        <p class="font-bold">${{ Number(prod.discount_price || prod.price).toFixed(2) }} <span v-if="prod.discount_price" class="text-muted-foreground line-through text-sm ml-1">${{ Number(prod.price).toFixed(2) }}</span></p>
        <div class="mt-3 flex gap-2">
          <button class="px-3 py-1.5 rounded-lg border border-border" @click="openEdit(prod)">Edit</button>
          <button class="px-3 py-1.5 rounded-lg bg-red-500 text-white" @click="remove(prod.id)">Delete</button>
        </div>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <button class="px-3 py-2 rounded-lg border border-border disabled:opacity-50" :disabled="page===1" @click="prev">Prev</button>
      <div class="text-sm text-muted-foreground">Page {{ page }}</div>
      <button class="px-3 py-2 rounded-lg border border-border disabled:opacity-50" :disabled="!canNext" @click="next">Next</button>
    </div>

    <AdminProductModal :open="showModal" :mode="mode" :product="editing" @close="showModal=false" @saved="afterSaved" />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'
import { useNotify } from '~/composables/useNotify'
import AdminProductModal from '~/components/admin/AdminProductModal.vue'

const emit = defineEmits<{ changed: [] }>()
const api = useApi()
const auth = useAuth()
const notify = useNotify()

const products = ref<any[]>([])
const page = ref(1)
const pageSize = ref(12)
const lastCount = ref(0)
const canNext = computed(() => lastCount.value >= pageSize.value)

const load = async () => {
  const skip = (page.value - 1) * pageSize.value
  const url = new URL(api.url('/products/'))
  url.searchParams.set('skip', String(skip))
  url.searchParams.set('limit', String(pageSize.value))
  const res = await fetch(url.toString())
  const data = await res.json().catch(() => [])
  const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
  products.value = list
  lastCount.value = list.length
}

const next = async () => { if (canNext.value) { page.value += 1; await load() } }
const prev = async () => { if (page.value > 1) { page.value -= 1; await load() } }

const showModal = ref(false)
const mode = ref<'create'|'edit'>('create')
const editing = ref<any | null>(null)
const openCreate = () => { mode.value = 'create'; editing.value = null; showModal.value = true }
const openEdit = (p: any) => { mode.value = 'edit'; editing.value = p; showModal.value = true }
const afterSaved = async () => { await load(); emit('changed') }

const remove = async (id: number) => {
  if (!confirm('Delete this product?')) return
  const res = await fetch(api.url(`/products/${id}`), { method: 'DELETE', headers: { Authorization: auth.token.value ? `Bearer ${auth.token.value}` : '' } })
  if (res.ok) {
    notify.success('Product deleted')
    await load()
  } else {
    notify.error('Failed to delete product')
  }
}

onMounted(load)
</script>
