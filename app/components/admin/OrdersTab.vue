<template>
  <section>
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-semibold text-foreground">Orders</h2>
      <div class="flex items-center gap-2">
        <button class="px-3 py-2 rounded-lg border border-border" @click="load">
          <RefreshCw class="w-4 h-4 inline mr-1" /> Refresh
        </button>
        <button class="px-3 py-2 rounded-lg bg-primary text-primary-foreground" @click="openCreate()">
          <Plus class="w-4 h-4 inline mr-1" /> New Order
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-muted-foreground">Loading orders...</div>
    <div v-else class="space-y-4">
      <div v-for="ord in orders" :key="ord.id" class="bg-card border border-border rounded-2xl p-4">
        <div class="flex justify-between items-start gap-3 mb-3">
          <div class="min-w-0">
            <div class="font-semibold text-foreground truncate">#{{ ord.id }} • {{ ord.product_name }}</div>
            <div class="mt-1 text-sm text-muted-foreground flex flex-wrap items-center">
              <span>Option: {{ ord.product_option }}</span>
              <span class="mx-2">•</span>
              <span>Qty: {{ ord.quantity }}</span>
              <span class="mx-2">•</span>
              <span>Price: ${{ Number(ord.price || 0).toFixed(2) }}</span>
              <template v-if="ord.user_info">
                <span class="mx-2">•</span>
                <span>User: {{ ord.user_info }}</span>
              </template>
              <template v-if="ord.note">
                <span class="mx-2">•</span>
                <span>Note: {{ ord.note }}</span>
              </template>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-1 rounded bg-secondary text-foreground">{{ ord.status || 'pending' }}</span>
            <button class="p-2 rounded-lg border border-border hover:bg-secondary" @click="printOrder(ord)" aria-label="Print order">
              <Printer class="w-4 h-4" />
            </button>
            <button class="p-2 rounded-lg border border-border hover:bg-secondary" @click="downloadOrderJpg(ord)" aria-label="Download JPG receipt">
              <Download class="w-4 h-4" />
            </button>
            <button class="p-2 rounded-lg border border-border hover:bg-secondary" @click="openEdit(ord)" aria-label="Edit order">
              <Pencil class="w-4 h-4" />
            </button>
            <button class="p-2 rounded-lg border border-border hover:bg-destructive/10 text-red-500" @click="remove(ord)" aria-label="Delete order">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div class="mt-2 flex items-center justify-center gap-4">
        <button class="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50" :disabled="page === 1" @click="goPage(page - 1)">Previous</button>
        <span class="text-sm text-muted-foreground">Page {{ page }}</span>
        <button class="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50" :disabled="!hasMore" @click="goPage(page + 1)">Next</button>
      </div>
    </div>

    <!-- Modal: Create / Edit Order -->
    <Teleport to="body">
      <Transition name="fade-modal">
        <div v-if="modal.open" class="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" @click="closeModal"></div>
          <div class="relative z-10 bg-card rounded-2xl p-6 border border-border w-full max-w-xl shadow-2xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-foreground">{{ modal.mode === 'edit' ? 'Edit Order' : 'Create Order' }}</h3>
              <button class="p-2 rounded-lg hover:bg-secondary" @click="closeModal">✕</button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm text-muted-foreground mb-1">Product Name</label>
                <input v-model="form.product_name" class="w-full px-3 py-2 rounded-lg border border-border bg-background" />
              </div>
              <div>
                <label class="block text-sm text-muted-foreground mb-1">Product Option</label>
                <input v-model="form.product_option" class="w-full px-3 py-2 rounded-lg border border-border bg-background" />
              </div>
              <div>
                <label class="block text-sm text-muted-foreground mb-1">Quantity</label>
                <input v-model.number="form.quantity" type="number" min="1" class="w-full px-3 py-2 rounded-lg border border-border bg-background" />
              </div>
              <div>
                <label class="block text-sm text-muted-foreground mb-1">Price</label>
                <input v-model="form.price" class="w-full px-3 py-2 rounded-lg border border-border bg-background" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm text-muted-foreground mb-1">User Info</label>
                <textarea v-model="form.user_info" rows="2" class="w-full px-3 py-2 rounded-lg border border-border bg-background"></textarea>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm text-muted-foreground mb-1">Note</label>
                <textarea v-model="form.note" rows="2" class="w-full px-3 py-2 rounded-lg border border-border bg-background"></textarea>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm text-muted-foreground mb-1">Status</label>
                <select v-model="form.status" class="w-full px-3 py-2 rounded-lg border border-border bg-background">
                  <option value="packaging">Packaging</option>
                  <option value="delivery">Delivery</option>
                  <option value="completed">Completed</option>
                  <option value="completed">Canceled</option>
                  <option value="packaging">Achieved</option>
                </select>
              </div>
            </div>

            <div class="mt-4 flex justify-end gap-2">
              <button class="px-3 py-2 rounded-lg border border-border" @click="closeModal">Cancel</button>
              <button class="px-3 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50" :disabled="saving || !form.product_name || !form.quantity || !form.price" @click="submit()">
                {{ saving ? 'Saving...' : (modal.mode === 'edit' ? 'Save Changes' : 'Create Order') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'
import { RefreshCw, Plus, Trash2, Pencil, Printer, Download } from 'lucide-vue-next'

const api = useApi()
const auth = useAuth()
const orders = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)

const modal = ref<{ open: boolean; mode: 'create' | 'edit'; id?: number | null }>({ open: false, mode: 'create', id: null })
const form = ref({
  product_name: '',
  product_option: '',
  quantity: 1,
  price: '',
  user_info: '',
  note: '',
  status: 'packaging'
})

const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(false)

const load = async () => {
  loading.value = true
  try {
    const offset = (page.value - 1) * pageSize.value
    const url = new URL(api.url('/orders/admin'))
    url.searchParams.set('offset', String(offset))
    url.searchParams.set('limit', String(pageSize.value))
    const res = await fetch(url.toString(), { headers: { Authorization: (auth.token.value ? `Bearer ${auth.token.value}` : '') } })
    const data = await res.json().catch(() => [])
    const list = Array.isArray(data) ? data : []
    orders.value = list.map((o: any) => ({ ...o, edit_status: o.status || 'packaging', edit_note: o.note || '' }))
    hasMore.value = list.length === pageSize.value
  } finally {
    loading.value = false
  }
}

const goPage = async (p: number) => {
  if (p < 1) return
  page.value = p
  await load()
}

const openCreate = () => {
  modal.value = { open: true, mode: 'create', id: null }
  form.value = { product_name: '', product_option: '', quantity: 1, price: '', user_info: '', note: '', status: 'packaging' }
}
const openEdit = (ord: any) => {
  modal.value = { open: true, mode: 'edit', id: ord.id }
  form.value = {
    product_name: ord.product_name || '',
    product_option: ord.product_option || '',
    quantity: Number(ord.quantity) || 1,
    price: String(ord.price ?? ''),
    user_info: ord.user_info || '',
    note: ord.note || '',
    status: ord.status || 'packaging'
  }
}
const closeModal = () => { modal.value.open = false }

const submit = async () => {
  try {
    saving.value = true
    if (modal.value.mode === 'create') {
      const res = await fetch(api.url('/orders/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: (auth.token.value ? `Bearer ${auth.token.value}` : '')
        },
        body: JSON.stringify(form.value)
      })
      if (res.ok) {
        closeModal()
        await load()
      }
    } else if (modal.value.mode === 'edit' && modal.value.id) {
      const res = await fetch(api.url(`/orders/${encodeURIComponent(modal.value.id)}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: (auth.token.value ? `Bearer ${auth.token.value}` : '')
        },
        body: JSON.stringify(form.value)
      })
      if (res.ok) {
        closeModal()
        await load()
      }
    }
  } finally {
    saving.value = false
  }
}

const remove = async (ord: any) => {
  if (!confirm(`Delete order #${ord.id}?`)) return
  const res = await fetch(api.url(`/orders/${encodeURIComponent(ord.id)}`), { method: 'DELETE', headers: { Authorization: (auth.token.value ? `Bearer ${auth.token.value}` : '') } })
  if (res.ok) {
    orders.value = orders.value.filter(o => o.id !== ord.id)
  }
}

const printOrder = (ord: any) => {
  const w = window.open('', '_blank', 'width=720,height=900')
  if (!w) return
  const html = `<!doctype html><html><head><meta charset="utf-8" />
  <title>Order #${ord.id}</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; padding: 24px; }
    h1 { font-size: 20px; margin: 0 0 12px; }
    .row { margin-bottom: 6px; }
    .label { color: #666; width: 140px; display: inline-block; }
    .val { color: #111; }
    hr { border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0; }
  </style></head><body>
  <h1>Order #${ord.id}</h1>
  <div class="row"><span class="label">Product</span><span class="val">${ord.product_name}</span></div>
  <div class="row"><span class="label">Option</span><span class="val">${ord.product_option}</span></div>
  <div class="row"><span class="label">Quantity</span><span class="val">${ord.quantity}</span></div>
  <div class="row"><span class="label">Price</span><span class="val">$${Number(ord.price || 0).toFixed(2)}</span></div>
  <div class="row"><span class="label">User</span><span class="val">${ord.user_info || ''}</span></div>
  <div class="row"><span class="label">Status</span><span class="val">${ord.status || ''}</span></div>
  <div class="row"><span class="label">Note</span><span class="val">${ord.note || ''}</span></div>
  <hr />
  <script>window.print(); setTimeout(() => window.close(), 300);<\/script>
  </body></html>`
  w.document.write(html)
  w.document.close()
}

const downloadOrderJpg = async (ord: any) => {
  // Build a clean, print-friendly receipt container to render
  const container = document.createElement('div')
  container.id = 'order-receipt-render'
  container.style.position = 'fixed'
  container.style.left = '-99999px'
  container.style.top = '0'
  container.innerHTML = `
    <div style="width:420px;background:#ffffff;color:#111827;padding:24px;border-radius:12px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
      <div style="text-align:center;margin-bottom:16px;">
        <div style="display:flex;gap:8px;align-items:center;justify-content:center;margin-bottom:6px;">
          <img src="/images/logo.png" alt="GenZ Vibe" style="height:28px;width:auto" />
          <div style="font-weight:800;color:#16a34a;font-size:18px;">Order Receipt</div>
        </div>
        <div style="font-size:12px;color:#6b7280;">GenZ Vibe • Tel: 096 407 4300</div>
      </div>
      <div style="border-bottom:1px dashed #d1d5db;padding-bottom:8px;margin-bottom:8px;font-size:13px;">
        <div style="display:flex;justify-content:space-between;margin:2px 0"><span style="color:#6b7280">Order ID:</span><span style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas; color:#1f2937">#${ord.id}</span></div>
        <div style="display:flex;justify-content:space-between;margin:2px 0"><span style="color:#6b7280">Product:</span><span style="color:#1f2937">${ord.product_name}</span></div>
        <div style="display:flex;justify-content:space-between;margin:2px 0"><span style="color:#6b7280">Option:</span><span style="color:#1f2937">${ord.product_option || '-'}</span></div>
        <div style="display:flex;justify-content:space-between;margin:2px 0"><span style="color:#6b7280">Quantity:</span><span style="color:#1f2937">${ord.quantity}</span></div>
        <div style="display:flex;justify-content:space-between;margin:2px 0"><span style="color:#6b7280">Price:</span><span style="color:#1f2937">$${Number(ord.price || 0).toFixed(2)}</span></div>
      </div>
      <div style="text-align:center;color:#9ca3af;font-size:12px;">Thank you for your order!</div>
    </div>
  `
  document.body.appendChild(container)
  try {
    const html2canvas = await import('html2canvas').then(m => m.default)
    const node = container.firstElementChild as HTMLElement
    const canvas = await html2canvas(node, { backgroundColor: '#ffffff', scale: 2, logging: false })
    const link = document.createElement('a')
    link.download = `order-${ord.id}.jpg`
    link.href = canvas.toDataURL('image/jpeg', 0.95)
    link.click()
  } finally {
    document.body.removeChild(container)
  }
}

load()
</script>

<style scoped>
.fade-modal-enter-active, .fade-modal-leave-active { transition: opacity .12s ease; }
.fade-modal-enter-from, .fade-modal-leave-to { opacity: 0; }
</style>

<!-- Footer slot not used; render pagination inline below list -->
