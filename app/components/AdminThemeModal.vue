<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[75] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
        <div class="relative z-10 bg-card rounded-3xl p-6 border border-border w-full max-w-xl shadow-2xl">
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg font-bold text-foreground">{{ mode === 'edit' ? 'Edit Theme' : 'Create Theme' }}</h3>
            <button class="p-2 rounded-lg hover:bg-secondary" @click="$emit('close')">✕</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="md:col-span-2">
              <label class="block text-sm text-muted-foreground mb-1">Title</label>
              <input v-model="form.title" class="w-full px-3 py-2 rounded-lg border border-border bg-background" placeholder="Theme title" />
            </div>
            <div>
              <label class="block text-sm text-muted-foreground mb-1">Category</label>
              <input v-model="form.category" class="w-full px-3 py-2 rounded-lg border border-border bg-background" placeholder="Category" />
            </div>
            <div>
              <label class="block text-sm text-muted-foreground mb-1">Description</label>
              <input v-model="form.description" class="w-full px-3 py-2 rounded-lg border border-border bg-background" placeholder="Description" />
            </div>

            <!-- Pretty file pickers -->
            <div>
              <label class="block text-sm text-muted-foreground mb-1">Thumbnail</label>
              <div class="border-2 border-dashed border-border rounded-xl p-4 text-sm text-muted-foreground flex items-center justify-between gap-3">
                <div class="truncate">
                  <span v-if="thumbName">{{ thumbName }}</span>
                  <span v-else>Choose thumbnail image...</span>
                </div>
                <label class="px-3 py-1.5 rounded-lg border border-border cursor-pointer">
                  Browse
                  <input type="file" class="hidden" @change="onThumb" accept="image/*" />
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm text-muted-foreground mb-1">Theme File</label>
              <div class="border-2 border-dashed border-border rounded-xl p-4 text-sm text-muted-foreground flex items-center justify-between gap-3">
                <div class="truncate">
                  <span v-if="fileName">{{ fileName }}</span>
                  <span v-else>Choose theme file (zip/html)...</span>
                </div>
                <label class="px-3 py-1.5 rounded-lg border border-border cursor-pointer">
                  Browse
                  <input type="file" class="hidden" @change="onFile" />
                </label>
              </div>
            </div>
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <button class="px-3 py-2 rounded-lg border border-border" @click="$emit('close')">Cancel</button>
            <button class="px-3 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50" :disabled="saving" @click="save">{{ saving ? 'Saving...' : (mode === 'edit' ? 'Save Changes' : 'Create') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'

const props = defineProps<{ open: boolean; mode?: 'create' | 'edit'; theme?: any }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const api = useApi()
const auth = useAuth()
const saving = ref(false)

const form = ref<{ title: string; description?: string; category?: string; thumbnail?: File | null; file?: File | null }>({ title: '', description: '', category: '', thumbnail: null, file: null })
const thumbName = ref('')
const fileName = ref('')

const onThumb = (e: Event) => { const f = (e.target as HTMLInputElement).files?.[0]; form.value.thumbnail = f || null; thumbName.value = f?.name || '' }
const onFile = (e: Event) => { const f = (e.target as HTMLInputElement).files?.[0]; form.value.file = f || null; fileName.value = f?.name || '' }

watch(() => props.open, (v) => {
  if (v) {
    if (props.mode === 'edit' && props.theme) {
      form.value.title = props.theme.title || ''
      form.value.category = props.theme.category || ''
      form.value.description = props.theme.description || ''
      thumbName.value = ''
      fileName.value = ''
      form.value.thumbnail = null
      form.value.file = null
    } else {
      form.value = { title: '', description: '', category: '', thumbnail: null, file: null }
      thumbName.value = ''
      fileName.value = ''
    }
  }
})

const save = async () => {
  try {
    saving.value = true
    const fd = new FormData()
    fd.set('title', form.value.title)
    if (form.value.description) fd.set('description', form.value.description)
    if (form.value.category) fd.set('category', form.value.category)
    if (form.value.thumbnail) fd.set('thumbnail', form.value.thumbnail)
    if (form.value.file) fd.set('file', form.value.file)
    let res: Response
    if (props.mode === 'edit' && props.theme?.id) {
      res = await fetch(api.url(`/themes/${encodeURIComponent(props.theme.id)}`), { method: 'PUT', headers: { Authorization: auth.token.value ? `Bearer ${auth.token.value}` : '' }, body: fd })
    } else {
      res = await fetch(api.url('/themes/'), { method: 'POST', headers: { Authorization: auth.token.value ? `Bearer ${auth.token.value}` : '' }, body: fd })
    }
    if (res.ok) {
      emit('saved')
      emit('close')
    }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .12s ease-out; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>

