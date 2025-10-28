<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
        <div class="relative z-10 bg-card rounded-3xl p-6 border border-border w-full max-w-lg shadow-2xl">
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg font-bold text-foreground">Account</h3>
            <button class="p-2 rounded-lg hover:bg-secondary" @click="$emit('close')">✕</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm text-muted-foreground mb-1">Phone</label>
              <input v-model="form.phone" type="tel" class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="+855 12 345 678" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm text-muted-foreground mb-1">Full Name</label>
              <input v-model="form.full_name" type="text" class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="John Doe" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm text-muted-foreground mb-1">Address</label>
              <input v-model="form.address" type="text" class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="House No, Street" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm text-muted-foreground mb-1">Full Address</label>
              <input v-model="form.full_address" type="text" class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Full address details" />
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button class="px-4 py-2 rounded-xl border border-border hover:bg-secondary" @click="$emit('close')">Cancel</button>
            <button class="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60" :disabled="saving" @click="save">{{ saving ? 'Saving...' : 'Save' }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const api = useApi()
const auth = useAuth()

const saving = ref(false)
const form = ref({
  phone: '',
  full_name: '',
  address: '',
  full_address: ''
})

const formatKhPhone = (raw: string) => {
  const s = (raw || '').replace(/\s+/g, '')
  if (!s) return ''
  if (s.startsWith('+')) return s
  if (s.startsWith('0')) return '+855' + s.slice(1)
  return '+855' + s
}

const loadProfile = () => {
  const p: any = auth.profile.value || {}
  form.value.full_name = p.full_name || ''
  form.value.phone = p.phone_number || ''
  form.value.address = p.address || ''
  form.value.full_address = p.full_address || ''
}

const fetchMe = async () => {
  try {
    const res = await api.get('/user/me')
    if (!res.ok) return
    const me = await res.json()
    auth.setProfile(me)
    loadProfile()
  } catch {}
}

const save = async () => {
  try {
    saving.value = true
    const body = {
      full_name: form.value.full_name,
      address: form.value.address,
      full_address: form.value.full_address,
      phone_number: formatKhPhone(form.value.phone)
    }
    const res = await api.post('/user/me', body, { method: 'PUT' })
    if (!res.ok) throw new Error('Update failed')
    const updated = await res.json()
    auth.setProfile(updated)
    emit('saved')
    emit('close')
  } catch (e) {
    console.error(e)
    alert('Failed to save profile')
  } finally {
    saving.value = false
  }
}

watch(() => props.open, (v) => {
  if (v) {
    loadProfile()
    fetchMe()
  }
})

onMounted(loadProfile)
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>

