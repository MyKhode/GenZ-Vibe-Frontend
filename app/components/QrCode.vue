<template>
  <div class="inline-flex flex-col items-center">
    <canvas ref="canvasRef" :width="size" :height="size" class="rounded bg-white" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'

const props = withDefaults(defineProps<{ text: string; size?: number }>(), { size: 220 })
const canvasRef = ref<HTMLCanvasElement | null>(null)

async function draw() {
  if (!canvasRef.value) return
  const text = props.text || ''
  if (!text) return
  try {
    const QR = await import('qrcode')
    await QR.toCanvas(canvasRef.value, text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: props.size,
      color: { dark: '#000000', light: '#FFFFFF' },
    } as any)
  } catch (e) {
    // Fallback: simple message if library missing
    const ctx = canvasRef.value.getContext('2d')!
    const w = canvasRef.value.width, h = canvasRef.value.height
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,w,h)
    ctx.fillStyle = '#222'; ctx.font = '12px sans-serif'
    ctx.fillText('Install "qrcode" package to render QR', 8, h/2)
  }
}

onMounted(() => nextTick(draw))
watch(() => [props.text, props.size], () => nextTick(draw))

defineExpose({ toDataURL: () => canvasRef.value?.toDataURL('image/png') || '' })
</script>
