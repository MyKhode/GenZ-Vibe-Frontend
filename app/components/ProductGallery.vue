<template>
  <div 
    class="group"
    @mouseenter="pause()"
    @mouseleave="play()"
  >
    <!-- Main image viewport with drag/swipe and bottom-centered color dots -->
    <div 
      class="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-secondary select-none"
    >
      <img 
        v-for="(src, i) in images" 
        :key="src + i"
        :src="src" 
        :alt="alt || `Product image ${i+1}`" 
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        :class="i === index ? 'opacity-100' : 'opacity-0'"
        loading="lazy"
        draggable="false"
      />

      <!-- Arrows -->
      <button
        class="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-black/30 text-white hover:bg-black/50"
        @click="prev"
        aria-label="Previous image"
        type="button"
      >
        ‹
      </button>
      <button
        class="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-black/30 text-white hover:bg-black/50"
        @click="next"
        aria-label="Next image"
        type="button"
      >
        ›
      </button>

      <!-- Bottom-centered dots: count = images.length, color cycles through colors[] -->
      <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        <button 
          v-for="(src, i) in images" 
          :key="src + 'dot' + i"
          :class="[
            'w-6 h-6 rounded-full border-2 border-background transition-transform hover:scale-110',
            getColorClass(getDotColor(i)),
            i === index && 'ring-2 ring-primary ring-offset-2 ring-offset-secondary'
          ]"
          @click.stop="go(i)"
          type="button"
          :aria-label="`Preview ${i+1}`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps<{
  images: string[]
  alt?: string
  autoplayMs?: number
  colors?: string[]
}>()

const index = ref(0)
let timer: number | undefined
const interval = () => props.autoplayMs ?? 4000
const getDotColor = (i: number) => {
  if (!props.colors || props.colors.length === 0) return 'gray'
  return props.colors[i % props.colors.length]
}

const next = () => {
  if (!props.images?.length) return
  index.value = (index.value + 1) % props.images.length
}

const prev = () => {
  if (!props.images?.length) return
  index.value = (index.value - 1 + props.images.length) % props.images.length
}

const go = (i: number) => {
  index.value = i
  pause()
}

const play = () => {
  pause()
  if (props.images?.length > 1) {
    timer = window.setInterval(next, interval())
  }
}

const pause = () => {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

onMounted(play)
onBeforeUnmount(pause)

watch(() => props.images, () => {
  index.value = 0
  play()
})

defineExpose({ next, prev, go })

const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    white: 'bg-gray-100',
    pink: 'bg-pink-400',
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-500'
  }
  return colorMap[color] || 'bg-gray-400'
}
</script>
