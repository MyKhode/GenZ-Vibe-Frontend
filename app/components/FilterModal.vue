<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="$emit('close')"
      >
        <div 
          class="bg-card rounded-3xl p-6 border border-border w-full max-w-md"
          @click.stop
        >
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-foreground">{{ t('menu.filter') }}</h2>
            <button 
              class="p-2 hover:bg-secondary rounded-lg transition-colors"
              @click="$emit('close')"
            >
              <X class="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div class="space-y-6">
            <!-- Type Filter -->
            <div>
              <h3 class="font-semibold text-foreground mb-3">{{ t('product.type') }}</h3>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    v-model="localFilters.types"
                    value="Wireless"
                    class="w-4 h-4 rounded border-gray-300"
                  />
                  <span class="text-sm text-foreground">Wireless</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    v-model="localFilters.types"
                    value="Wired"
                    class="w-4 h-4 rounded border-gray-300"
                  />
                  <span class="text-sm text-foreground">Wired</span>
                </label>
              </div>
            </div>

            <!-- Price Range -->
            <div>
              <h3 class="font-semibold text-foreground mb-3">Price Range</h3>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    v-model="localFilters.priceRange"
                    value="all"
                    class="w-4 h-4"
                  />
                  <span class="text-sm text-foreground">All Prices</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    v-model="localFilters.priceRange"
                    value="under100"
                    class="w-4 h-4"
                  />
                  <span class="text-sm text-foreground">Under $100</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    v-model="localFilters.priceRange"
                    value="100-200"
                    class="w-4 h-4"
                  />
                  <span class="text-sm text-foreground">$100 - $200</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    v-model="localFilters.priceRange"
                    value="over200"
                    class="w-4 h-4"
                  />
                  <span class="text-sm text-foreground">Over $200</span>
                </label>
              </div>
            </div>

            
          </div>

          <div class="flex gap-3 mt-6">
            <button 
              class="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-bold py-3 rounded-xl transition-colors"
              @click="handleReset"
            >
              Reset
            </button>
            <button 
              class="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-colors"
              @click="handleApply"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { useI18n } from '~/composables/useI18n'

interface Filters {
  types: string[]
  priceRange: string
}

const props = defineProps<{
  isOpen: boolean
  filters: Filters
}>()

const emit = defineEmits<{
  close: []
  apply: [filters: Filters]
}>()

const localFilters = ref<Filters>({ ...props.filters })

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

const handleReset = () => {
  localFilters.value = {
    types: [],
    priceRange: 'all'
  }
}

const handleApply = () => {
  emit('apply', localFilters.value)
  emit('close')
}

const { t } = useI18n()
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active { transition: opacity .12s ease-out; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
</style>
