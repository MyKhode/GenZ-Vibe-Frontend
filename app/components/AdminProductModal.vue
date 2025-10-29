<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[75] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
        <div class="relative z-10 bg-card rounded-3xl p-6 border border-border w-full max-w-3xl shadow-2xl">
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg font-bold text-foreground">
              {{ mode === 'edit' ? 'Edit Product' : 'Create Product' }}
            </h3>
            <button class="p-2 rounded-lg hover:bg-secondary" @click="$emit('close')">✕</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Name -->
            <div>
              <label class="block text-sm text-muted-foreground mb-1">Name</label>
              <input
                v-model="form.name"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            <!-- Type -->
            <div>
              <label class="block text-sm text-muted-foreground mb-1">Type</label>
              <input
                v-model="form.type"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            <!-- Price -->
            <div>
              <label class="block text-sm text-muted-foreground mb-1">Price</label>
              <input
                v-model.number="form.price"
                type="number"
                step="0.01"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            <!-- Discount Price -->
            <div>
              <label class="block text-sm text-muted-foreground mb-1">Discount Price</label>
              <input
                v-model.number="form.discount_price"
                type="number"
                step="0.01"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            <!-- Description -->
            <div class="md:col-span-2">
              <label class="block text-sm text-muted-foreground mb-1">Description</label>
              <textarea
                v-model="form.description"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
                rows="3"
              ></textarea>
            </div>

            <!-- Khmer fields -->
            <div>
              <label class="block text-sm text-muted-foreground mb-1">Name (KM)</label>
              <input
                v-model="form.name_km"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <div>
              <label class="block text-sm text-muted-foreground mb-1">Description (KM)</label>
              <input
                v-model="form.description_km"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            <!-- Features -->
            <div class="md:col-span-2">
              <label class="block text-sm text-muted-foreground mb-1">Features</label>
              <textarea
                v-model="form.features"
                placeholder="One feature per line"
                rows="4"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
              ></textarea>
            </div>

            <!-- Options -->
            <div class="md:col-span-2">
              <label class="block text-sm text-muted-foreground mb-1">Options JSON</label>
              <input
                v-model="form.options"
                placeholder='["Small","Large"]'
                class="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            <!-- Image uploads with + and remove -->
            <div class="md:col-span-2">
              <label class="block text-sm text-muted-foreground mb-1">Product Images</label>
              <div class="space-y-3">
                <div
                  v-for="(image, index) in imageFiles"
                  :key="index"
                  class="border-2 border-dashed border-border rounded-xl p-4"
                >
                  <div class="flex items-center justify-between">
                    <div class="text-sm text-muted-foreground">
                      <span v-if="image.file">{{ image.file.name }}</span>
                      <span v-else>Select image file...</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <label
                        class="px-3 py-1.5 rounded-lg border border-border cursor-pointer"
                      >
                        Browse
                        <input
                          type="file"
                          class="hidden"
                          @change="onImageChange($event, index)"
                          accept="image/*"
                        />
                      </label>
                      <button
                        v-if="imageFiles.length > 1"
                        class="px-2 py-1 rounded-lg border border-border text-xs text-red-500 hover:bg-destructive/10"
                        @click="removeImage(index)"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <div v-if="image.preview" class="mt-2">
                    <img
                      :src="image.preview"
                      class="w-32 h-32 object-cover rounded-lg border border-border"
                    />
                  </div>
                </div>
                <button
                  class="mt-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-secondary"
                  @click="addImage"
                >
                  ＋ Add Image
                </button>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="mt-5 flex justify-end gap-2">
            <button class="px-3 py-2 rounded-lg border border-border" @click="$emit('close')">
              Cancel
            </button>
            <button
              class="px-3 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
              :disabled="saving"
              @click="save"
            >
              {{ saving ? 'Saving...' : (mode === 'edit' ? 'Save Changes' : 'Create') }}
            </button>
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

const props = defineProps<{ open: boolean; mode?: 'create' | 'edit'; product?: any }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const api = useApi()
const auth = useAuth()
const saving = ref(false)

const form = ref({
  name: '',
  type: '',
  price: null as number | null,
  discount_price: null as number | null,
  description: '',
  name_km: '',
  description_km: '',
  features: '',
  options: '',
})

// Multiple image uploads
const imageFiles = ref<{ file?: File; preview?: string }[]>([{ file: undefined, preview: '' }])

const addImage = () => {
  imageFiles.value.push({ file: undefined, preview: '' })
}

const removeImage = (index: number) => {
  imageFiles.value.splice(index, 1)
}

const onImageChange = (e: Event, index: number) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const target = imageFiles.value[index]
  if (!target) return
  target.file = file
  target.preview = URL.createObjectURL(file)
}

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
          name_km: p.name_km || p.nameKm || '',
          description_km: p.description_km || p.descriptionKm || '',
          features: (p.features || []).join('\n'),
          options: JSON.stringify(p.options || []),
        }
      } else {
        form.value = {
          name: '',
          price: null,
          type: '',
          discount_price: null,
          description: '',
          features: '',
          name_km: '',
          description_km: '',
          options: '',
        }
      }
      imageFiles.value = [{ file: undefined, preview: '' }]
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
    if (form.value.features)
      fd.set('features', JSON.stringify(form.value.features.split('\n').filter(Boolean)))
    if (form.value.options) fd.set('options', form.value.options)

    for (const img of imageFiles.value) {
      if (img.file) fd.append('image_files', img.file)
    }

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
      emit('saved')
      emit('close')
    }
  } finally {
    saving.value = false
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
