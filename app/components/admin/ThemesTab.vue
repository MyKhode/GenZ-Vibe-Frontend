<template>
  <section>
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-semibold text-foreground">Themes</h2>
      <button class="px-3 py-2 rounded-lg bg-primary text-primary-foreground" @click="openCreate">Create Theme</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="th in themes" :key="th.id" class="bg-card border border-border rounded-2xl overflow-hidden">
        <img v-if="th.thumbnail" :src="assetUrl(th.thumbnail)" :alt="th.title" class="w-full aspect-video object-cover" />
        <div class="p-4">
          <h3 class="font-semibold text-foreground mb-1">{{ th.title }}</h3>
          <p class="text-sm text-muted-foreground mb-3">{{ th.description }}</p>
          <div class="flex items-center justify-between text-sm text-muted-foreground">
            <span>{{ th.category }}</span>
            <span>Downloads: {{ th.downloads || 0 }}</span>
          </div>
          <div class="mt-3 flex gap-2">
            <button class="px-3 py-1.5 rounded-lg border border-border" @click="openEdit(th)">Edit</button>
            <button class="px-3 py-1.5 rounded-lg bg-red-500 text-white" @click="remove(th.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <button class="px-3 py-2 rounded-lg border border-border disabled:opacity-50" :disabled="page===1" @click="prev">Prev</button>
      <div class="text-sm text-muted-foreground">Page {{ page }}</div>
      <button class="px-3 py-2 rounded-lg border border-border disabled:opacity-50" :disabled="!canNext" @click="next">Next</button>
    </div>

    <AdminThemeModal :open="showModal" :mode="mode" :theme="editing" @close="showModal=false" @saved="afterSaved" />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'
import { fetchThemes } from '~/services/themes'
import AdminThemeModal from '~/components/admin/AdminThemeModal.vue'
import { useRuntimeConfig } from '#app'

const emit = defineEmits<{ changed: [] }>()
const api = useApi()
const auth = useAuth()
const config = useRuntimeConfig()
const apiBase = (config.public as any)?.apiBase as string | undefined
const assetUrl = (p?: string) => {
  if (!p) return ''
  if (/^https?:\/\//i.test(p)) return p
  const path = p.startsWith('/') ? p.slice(1) : p
  if (apiBase) return apiBase.replace(/\/$/, '') + '/' + path
  return '/' + path
}

const themes = ref<any[]>([])
const page = ref(1)
const pageSize = ref(12)
const lastCount = ref(0)
const canNext = computed(() => lastCount.value >= pageSize.value)

const load = async () => {
  const skip = (page.value - 1) * pageSize.value
  const items = await fetchThemes({ limit: pageSize.value, skip })
  themes.value = items
  lastCount.value = items.length
}

const next = async () => { if (canNext.value) { page.value += 1; await load() } }
const prev = async () => { if (page.value > 1) { page.value -= 1; await load() } }

const showModal = ref(false)
const mode = ref<'create'|'edit'>('create')
const editing = ref<any | null>(null)
const openCreate = () => { mode.value = 'create'; editing.value = null; showModal.value = true }
const openEdit = (t: any) => { mode.value = 'edit'; editing.value = t; showModal.value = true }
const afterSaved = async () => { await load(); emit('changed') }

const remove = async (id: string) => {
  if (!confirm('Delete this theme?')) return
  const res = await fetch(api.url(`/themes/${encodeURIComponent(id)}`), {
    method: 'DELETE',
    headers: { Authorization: auth.token.value ? `Bearer ${auth.token.value}` : '' }
  })
  if (res.ok) await load()
}

onMounted(load)
</script>
