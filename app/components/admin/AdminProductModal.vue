<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-[75] flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
        <div
          class="relative z-10 bg-card rounded-3xl p-6 border border-border w-full max-w-3xl shadow-2xl"
        >
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg font-bold text-foreground">
              {{ mode === 'edit' ? 'Edit Product' : 'Create Product' }}
            </h3>
            <button
              class="px-2 py-1 rounded-lg hover:bg-secondary"
              @click="$emit('close')"
            >
              ✕
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Basic info -->
            <div>
              <label class="block text-sm text-muted-foreground mb-1">Name</label>
              <input
                v-model="form.name"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <div>
              <label class="block text-sm text-muted-foreground mb-1">Type</label>
              <input
                v-model="form.type"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <div>
              <label class="block text-sm text-muted-foreground mb-1">Price</label>
              <input
                v-model.number="form.price"
                type="number"
                step="0.01"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <div>
              <label class="block text-sm text-muted-foreground mb-1"
                >Discount Price</label
              >
              <input
                v-model.number="form.discount_price"
                type="number"
                step="0.01"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            <!-- Descriptions -->
            <div class="md:col-span-2">
              <label class="block text-sm text-muted-foreground mb-1"
                >Description</label
              >
              <textarea
                v-model="form.description"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
                rows="3"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm text-muted-foreground mb-1"
                >Name (KM)</label
              >
              <input
                v-model="form.name_km"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <div>
              <label class="block text-sm text-muted-foreground mb-1"
                >Description (KM)</label
              >
              <input
                v-model="form.description_km"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            <!-- Dynamic Addons Builder -->
            <div class="md:col-span-2">
              <label class="block text-sm text-muted-foreground">Addons</label>
              <p class="text-xs text-muted-foreground mb-2">Create any groups (e.g., colors, types) and add items. Each item needs an image.</p>
              <div class="space-y-4">
                <div v-for="(grp, gi) in groups" :key="grp._key" class="border border-border rounded-2xl p-3">
                  <div class="flex items-center gap-2 mb-2">
                    <input v-model="grp.key" placeholder="Group key (e.g., colors)" class="flex-1 px-3 py-2 rounded-lg border border-border bg-background" />
                    <button class="p-3 rounded-lg border border-border text-red-500 hover:bg-destructive/10" @click="removeGroup(gi)" aria-label="Remove group">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                  <div class="space-y-2">
                    <div v-for="(row, i) in grp.items" :key="row._key" class="grid grid-cols-1 md:grid-cols-[40px_1fr_120px_120px_42px] gap-2 items-center">
                      <div class="w-10 h-10 border border-border rounded-lg flex items-center justify-center overflow-hidden bg-secondary">
                        <template v-if="row._preview || row.image">
                          <img :src="row._preview || toAbsolute(row.image || '')" class="w-full h-full object-cover" />
                        </template>
                        <template v-else>
                          <ImageIcon class="w-6 h-6 text-muted-foreground" />
                        </template>
                      </div>
                      <input v-model="row.name" placeholder="Name" class="px-3 py-2 rounded-lg border border-border bg-background" />
                      <input v-model.number="row.price" type="number" step="0.01" placeholder="Price" class="px-3 py-2 rounded-lg border border-border bg-background" />
                      <label class="px-3 py-2 text-center rounded-lg border border-border cursor-pointer text-sm bg-secondary hover:bg-secondary/80">Browse
                        <input type="file" class="hidden" accept="image/*" @change="onRowFileChange($event, gi, i)" />
                      </label>
                      <button class="h-9 rounded-lg border border-border text-red-500 flex items-center justify-center" @click="removeItem(gi, i)" aria-label="Remove item">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                    <button class="mt-1 px-3 py-2 rounded-lg border border-border text-sm hover:bg-secondary" @click="addItem(gi)">＋ Add Item</button>
                  </div>
                </div>
                <button class="px-3 py-2 rounded-lg border border-border text-sm hover:bg-secondary" @click="addGroup">＋ Add Addon Group</button>
              </div>
            </div>

            <!-- Features -->
            <div class="md:col-span-2">
              <label class="block text-sm text-muted-foreground mb-1"
                >Features (one per line)</label
              >
              <textarea
                v-model="featuresText"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
                rows="3"
                placeholder="Wireless connectivity\nPremium audio quality\nComfortable design"
              ></textarea>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-5 flex justify-between items-center gap-2">
            <p v-if="missingImages" class="text-xs text-red-500">Each addon item needs an image. Upload or paste an image URL.</p>
            <button
              class="px-3 py-2 rounded-lg border border-border"
              @click="$emit('close')"
            >
              Cancel
            </button>
            <button
              class="px-3 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
              :disabled="saving || !form.name || form.price == null || missingImages"
              @click="save"
            >
              {{ saving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Trash2, Image as ImageIcon } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'
import { useNotify } from '~/composables/useNotify'

const props = defineProps<{ open: boolean; mode?: 'create' | 'edit'; product?: any }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const api = useApi()
const auth = useAuth()
const notify = useNotify()
const saving = ref(false)

const form = ref({
  name: '',
  type: '',
  price: null as number | null,
  discount_price: null as number | null,
  description: '',
  name_km: '',
  description_km: '',
})

const featuresText = ref('')

type AddonRow = { _key: string; id?: number | null; name: string; price: number | null; image?: string | null; _preview?: string }
type AddonGroup = { _key: string; key: string; label?: string; items: AddonRow[] }
const groups = ref<AddonGroup[]>([])

const addGroup = () => groups.value.push({ _key: `g-${Date.now()}-${Math.random()}`, key: '', label: '', items: [] })
const removeGroup = async (gi: number) => {
  const g = groups.value[gi]
  if (g) {
    // Best-effort delete all media for rows in this group
    for (const row of g.items) {
      const img = (row.image || '').trim()
      if (img) await deleteMedia(img)
    }
  }
  groups.value.splice(gi, 1)
}
const addItem = (gi: number) => {
  const g = groups.value[gi]
  if (!g) return
  g.items.push({ _key: `i-${Date.now()}-${Math.random()}`, id: undefined, name: '', price: null, image: '', _preview: '' })
}
const removeItem = async (gi: number, i: number) => {
  const g = groups.value[gi]
  if (!g) return
  const row = g.items[i]
  const img = (row?.image || '').trim()
  if (img) await deleteMedia(img)
  g.items.splice(i, 1)
}

// Build absolute image URL from runtime public api base for previews
const runtimeConfig = useRuntimeConfig()
const apiBase = (runtimeConfig.public?.apiBase || '') as string
const toAbsolute = (src?: string | null): string => {
  const s = src || ''
  if (!s) return ''
  if (/^(https?:)?\/\//.test(s) || s.startsWith('data:')) return s
  const base = apiBase.replace(/\/$/, '')
  const path = s.replace(/^\//, '')
  return base ? `${base}/${path}` : `/${path}`
}

const missingImages = computed(() => {
  for (const g of groups.value) {
    for (const it of g.items) {
      const img = (it.image || '').trim()
      if (!img) return true
    }
  }
  return false
})

const onRowFileChange = async (e: Event, gi: number, i: number) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const row = groups.value[gi]?.items?.[i]
  if (!row) return
  row._preview = URL.createObjectURL(file)
  const prevImage = (row.image || '').trim()
  // Upload to backend: POST /products/options/images with FormData field 'files'
  const fd = new FormData()
  fd.append('files', file)
  try {
    const res = await fetch(api.url('/products/options/images'), {
      method: 'POST',
      headers: { Authorization: auth.token.value ? `Bearer ${auth.token.value}` : '' },
      body: fd,
    })
    if (res.ok) {
      const data = await res.json().catch(() => ({}))
      const list: string[] = Array.isArray((data as any).images) ? (data as any).images : []
      const loc = list[0] || ''
      row.image = loc || row.image || ''
      if (row.image) row._preview = toAbsolute(row.image)
      // If replaced an existing image, delete the old media
      if (prevImage && loc && prevImage !== loc) {
        await deleteMedia(prevImage)
      }
    }
  } catch {}
}

// removed legacy image uploader

watch(
  () => props.open,
  (v) => {
    if (v) {
      if (props.mode === 'edit' && props.product) {
        const p = props.product
        form.value = {
          name: p.name || '',
          type: p.type || '',
          price: Number(p.price) || 0,
          discount_price: p.discount_price ?? null,
          description: p.description || '',
          name_km: p.name_km || p.nameKm,
          description_km: p.description_km || p.descriptionKm,
        }
        featuresText.value = Array.isArray(p.features) ? p.features.join('\n') : ''
        // Load dynamic addons from options JSON
        const opts = typeof p.options === 'string' ? safeParse(p.options) : (p.options || {})
        const addons = (opts && (opts.addons || {})) as Record<string, any[]>
        groups.value = Object.entries(addons || {}).map(([key, arr]) => ({
          _key: `g-${cryptoKey()}`,
          key,
          label: '',
          items: (Array.isArray(arr) ? arr : []).map((r: any) => ({
            _key: `i-${cryptoKey()}`,
            id: toNum(r.id),
            name: r.name || '',
            price: toNum(r.price),
            image: r.image || '',
            _preview: r.image ? toAbsolute(r.image) : ''
          }))
        }))
        if (!groups.value.length) addGroup()
        if (groups.value[0] && !groups.value[0].items.length) addItem(0)
      } else {
        form.value = {
          name: '',
          type: '',
          price: null,
          discount_price: null,
          description: '',
          name_km: '',
          description_km: '',
        }
        featuresText.value = ''
        groups.value = []
        addGroup()
        if (groups.value[0]) addItem(0)
      }
    }
  }
)

const save = async () => {
  try {
    saving.value = true
    const fd = new FormData()
    fd.set('name', form.value.name)
    if (form.value.type) fd.set('type', form.value.type)
    if (form.value.price != null) fd.set('price', String(form.value.price))
    if (form.value.discount_price != null)
      fd.set('discount_price', String(form.value.discount_price))
    if (form.value.description) fd.set('description', form.value.description)
    if (form.value.name_km) fd.set('name_km', form.value.name_km)
    if (form.value.description_km) fd.set('description_km', form.value.description_km)

    // Build options JSON object
    const clean = (rows: AddonRow[]) => rows
      .map(r => ({ name: (r.name || '').trim(), price: toNum(r.price), image: (r.image || '').trim() }))
      .filter(r => r.name && !!r.image)
    const addonsObj: Record<string, any[]> = {}
    for (const g of groups.value) {
      const key = (g.key || '').trim()
      if (!key) continue
      addonsObj[key] = clean(g.items)
    }
    const optionsObj = { addons: addonsObj }
    fd.set('options', JSON.stringify(optionsObj))

    // Features
    const feats = featuresText.value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
    if (feats.length) fd.set('features', JSON.stringify(feats))

    let res: Response
    if (props.mode === 'edit' && props.product?.id) {
      res = await fetch(api.url(`/products/${encodeURIComponent(props.product.id)}`), {
        method: 'PUT',
        headers: { Authorization: auth.token.value ? `Bearer ${auth.token.value}` : '' },
        body: fd,
      })
    } else {
      res = await fetch(api.url('/products/'), {
        method: 'POST',
        headers: { Authorization: auth.token.value ? `Bearer ${auth.token.value}` : '' },
        body: fd,
      })
    }

    if (res.ok) {
      notify.success(props.mode === 'edit' ? 'Product updated' : 'Product created')
      emit('saved')
      emit('close')
    } else {
      notify.error('Failed to save product')
    }
  } finally {
    saving.value = false
  }
}

function safeParse(s: string) {
  try { return JSON.parse(s) } catch { return {} }
}
function toNum(v: any): number | null {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
function cryptoKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Delete media helper (admin-only endpoint on backend)
async function deleteMedia(target: string) {
  const t = (target || '').trim()
  if (!t) return
  try {
    // Prefer passing the returned path (e.g., media/products/abc.jpg). Scope 'products' helps for filename-only.
    await api.post('/media/delete', { target: t, scope: 'products' })
  } catch {
    // Ignore delete failures silently in UI
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.12s ease-out;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
