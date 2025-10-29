<template>
  <div class="fixed right-4 z-[90] space-y-2 w-[min(92vw,360px)] top-4 md:top-auto md:bottom-4">
    <div 
      v-for="t in items" :key="t.id"
      class="border rounded-xl p-3 shadow-lg flex items-start gap-3"
      :class="bgClass(t.type)"
    >
      <div class="w-2 h-2 mt-2 rounded-full" :class="dotClass(t.type)"></div>
      <div class="flex-1 min-w-0">
        <p v-if="t.title" class="text-sm font-semibold mb-0.5">{{ t.title }}</p>
        <p class="text-sm text-foreground truncate">{{ t.message }}</p>
      </div>
      <button class="text-muted-foreground hover:text-foreground" @click="remove(t.id)">✕</button>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotify, type NotifyType } from '~/composables/useNotify'

const notify = useNotify()
const items = computed(() => notify.list.value)
const remove = (id: number) => notify.remove(id)

const bgClass = (tp: NotifyType) => {
  switch (tp) {
    case 'success': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 text-emerald-900 dark:text-emerald-200'
    case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-300 text-red-900 dark:text-red-200'
    case 'warning': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 text-amber-900 dark:text-amber-200'
    default: return 'bg-card border-border'
  }
}
const dotClass = (tp: NotifyType) => {
  switch (tp) {
    case 'success': return 'bg-emerald-500'
    case 'error': return 'bg-red-500'
    case 'warning': return 'bg-amber-500'
    default: return 'bg-primary'
  }
}
</script>
