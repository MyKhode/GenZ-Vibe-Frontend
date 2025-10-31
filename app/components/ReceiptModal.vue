<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[90] flex items-center justify-center p-0 sm:p-4">
        <div class="absolute inset-0 bg-black/60" @click="$emit('close')" />
        <div class="relative z-10 bg-card w-full p-2 rounded-none border-none p-0 overflow-y-auto sm:w-full sm:max-w-md sm:max-h-[90vh] sm:rounded-2xl sm:border sm:border-border sm:p-6">
          <button
            class="absolute top-2 right-2 md:top-10 md:right-10 p-2 rounded-lg hover:bg-secondary transition-colors"
            @click="$emit('close')" 
            aria-label="Close"
          >
            <X class="w-5 h-5 text-muted-foreground" />
          </button>

          <!-- Receipt Content (compact) -->
          <div ref="receiptRef" id="receipt-print" class="bg-white text-black p-4 sm:p-6 rounded-none sm:rounded-xl">
            <!-- Header (compact with centered logo) -->
            <div class="text-center mb-4">
              <img src="/images/logo.png" alt="GenZ Vibe" class="mx-auto h-8 sm:h-10 mb-1.5" />
              <h2 class="text-lg sm:text-xl font-bold text-success">Payment Success!</h2>
              <p class="text-xs text-muted">Thank you for your purchase</p>
            </div>

            <!-- Store Info (single line) -->
            <div class="text-center border-b border-dashed border-muted pb-3 mb-3">
              <p class="text-xs text-strong font-semibold">GenZ Vibe</p>
              <p class="text-[11px] text-muted">Tel: 096 407 4300 • Phnom Penh, Cambodia</p>
            </div>

            <!-- Order Details (2 compact lines) -->
            <div class="space-y-1.5 mb-3 text-[13px]">
              <div class="flex items-center justify-between">
                <span class="text-muted">Order:</span>
                <span class="font-mono font-semibold text-strong">#{{ orderId }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted">Date:</span>
                <span class="text-strong">{{ orderDate }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted">Customer:</span>
                <span class="text-strong truncate">{{ customerName }} • {{ customerPhone }}</span>
              </div>
            </div>

            <!-- Items -->
            <div class="border-t border-b border-muted py-2 mb-2">
              <h4 class="font-semibold text-strong mb-1 text-xs">Items</h4>
              <div class="space-y-2">
                <div v-for="(item, i) in items" :key="i" class="text-xs">
                  <div class="flex justify-between gap-3">
                    <span class="text-title truncate">{{ item.name }}</span>
                    <span class="text-strong font-medium whitespace-nowrap">${{ item.price.toFixed(2) }}</span>
                  </div>
                  <div v-if="item.options" class="text-[11px] text-faint ml-2">
                    {{ item.options }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div class="space-y-1.5 mb-3">
              <div class="flex justify-between text-sm leading-tight">
                <span class="text-muted">Subtotal:</span>
                <span class="text-strong">${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-sm leading-tight">
                <span class="text-muted">Shipping:</span>
                <span class="text-strong">${{ shipping.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-base sm:text-lg font-bold border-t border-muted pt-2">
                <span class="text-strong">Total:</span>
                <span class="text-title">${{ total.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="bg-soft rounded-lg p-2 mb-3">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-muted">Payment Method:</span>
                <div class="flex items-center gap-2">
                  <img src="/images/payment.png" alt="KHQR" class="h-4 w-auto" />
                  <span class="text-[11px] font-semibold text-strong">KHQR</span>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="text-center text-[11px] text-faint border-t border-dashed border-muted pt-2">
              <p>Thank you for shopping with us! Visit us again at GenZ Vibe</p>
            </div>
          </div>

          <!-- Download Button -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6">
            <button
              @click="downloadReceipt"
              class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Download class="w-5 h-5" />
              Download JPG
            </button>
            <button
              @click="downloadPdf"
              class="w-full bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Download class="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { X, Download } from 'lucide-vue-next'

interface ReceiptItem {
  name: string
  price: number
  options?: string
}

interface Props {
  open: boolean
  orderId: string
  orderDate: string
  customerName: string
  customerPhone: string
  items: ReceiptItem[]
  subtotal: number
  shipping: number
  total: number
}

const props = defineProps<Props>()

defineEmits<{
  close: []
}>()

const receiptRef = ref<HTMLElement | null>(null)

const downloadReceipt = async () => {
  if (!receiptRef.value) return
  try {
    await nextTick()
    const html2canvas = await import('html2canvas').then(m => m.default)
    const canvas = await html2canvas(receiptRef.value, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      onclone: (doc) => {
        // Ensure safe HEX colors inside the clone to match on-screen look
        const style = doc.createElement('style')
        style.textContent = `
          #receipt-print { background: #ffffff !important; color: #111827 !important; }
          #receipt-print .text-success { color: #16a34a !important; }
          #receipt-print .text-muted { color: #6b7280 !important; }
          #receipt-print .text-strong { color: #1f2937 !important; }
          #receipt-print .text-title { color: #111827 !important; }
          #receipt-print .text-faint { color: #9ca3af !important; }
          #receipt-print .border-muted { border-color: #d1d5db !important; }
          #receipt-print .bg-soft { background-color: #f9fafb !important; }
        `
        doc.head.appendChild(style)
      }
    })
    const link = document.createElement('a')
    link.download = `receipt-${props.orderId}.jpg`
    link.href = canvas.toDataURL('image/jpeg', 0.95)
    link.click()
  } catch (error) {
    console.error('Error generating receipt:', error)
    alert('Failed to generate receipt. Please try again.')
  }
}

const downloadPdf = () => {
  const w = window.open('', '_blank', 'width=720,height=900')
  if (!w) return
  const html = `<!doctype html><html><head><meta charset="utf-8" />
  <title>Receipt ${props.orderId}</title>
  <style>
    body { margin: 0; padding: 24px; background: #fff; color: #111827; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
    .wrap { max-width: 420px; margin: 0 auto; }
    /* Color fallbacks for print */
    .text-muted { color: #6b7280; }
    .text-strong { color: #1f2937; }
    .text-title { color: #111827; }
    .text-faint { color: #9ca3af; }
    .text-success { color: #16a34a; }
    .border-muted { border-color: #d1d5db; }
    .bg-soft { background: #f9fafb; }
  </style></head><body>
  <div class="wrap">
    <div style="width:100%;background:#ffffff;color:#111827;padding:16px;border-radius:12px;">
      <div style="text-align:center;margin-bottom:12px;">
        <div style="display:flex;gap:8px;align-items:center;justify-content:center;margin-bottom:4px;">
          <img src="/images/logo.png" alt="GenZ Vibe" style="height:22px;width:auto" />
          <div style="font-weight:800;color:#16a34a;font-size:16px;">Payment Success!</div>
        </div>
        <div style="font-size:11px;color:#6b7280;">Thank you for your purchase</div>
      </div>
      <div style="text-align:center;border-bottom:1px dashed #d1d5db;padding-bottom:6px;margin-bottom:6px;">
        <div style="font-size:14px;font-weight:800;color:#1f2937;">GenZ Vibe</div>
        <div style="font-size:11px;color:#6b7280;">Tel: 096 407 4300 • Phnom Penh, Cambodia</div>
      </div>
      <div style="font-size:12px;margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;margin:2px 0"><span style="color:#6b7280">Order:</span><span style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas; color:#1f2937">#${props.orderId}</span></div>
        <div style="display:flex;justify-content:space-between;margin:2px 0"><span style="color:#6b7280">Date:</span><span style="color:#1f2937">${props.orderDate}</span></div>
        <div style="display:flex;justify-content:space-between;margin:2px 0"><span style="color:#6b7280">Customer:</span><span style="color:#1f2937">${props.customerName} • ${props.customerPhone}</span></div>
      </div>
      <div style="border-top:1px solid #d1d5db;border-bottom:1px solid #d1d5db;padding:6px 0;margin:6px 0;">
        <div style="font-weight:600;color:#1f2937;margin-bottom:4px;font-size:12px;">Items</div>
        ${props.items.map((it) => `
          <div style=\"font-size:12px;margin-bottom:4px;\">
            <div style=\"display:flex;justify-content:space-between;\"><span style=\"color:#111827\">${(it as any).name}</span><span style=\"color:#1f2937;font-weight:600\">$${Number((it as any).price).toFixed(2)}</span></div>
            ${(it as any).options ? `<div style=\"color:#9ca3af;font-size:11px;margin-left:8px\">${(it as any).options}</div>` : ''}
          </div>
        `).join('')}
      </div>
      <div style="font-size:12px;margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;margin:2px 0"><span style="color:#6b7280">Subtotal:</span><span style="color:#1f2937">$${Number(props.subtotal).toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;margin:2px 0"><span style="color:#6b7280">Shipping:</span><span style="color:#1f2937">$${Number(props.shipping).toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;margin:6px 0;padding-top:6px;border-top:1px solid #d1d5db;font-weight:800;"><span style="color:#1f2937">Total:</span><span style="color:#111827">$${Number(props.total).toFixed(2)}</span></div>
      </div>
      <div style="background:#f9fafb;border-radius:8px;padding:6px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:11px;color:#6b7280">Payment Method:</span>
        <div style="display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;color:#1f2937">
          <img src="/images/payment.png" alt="KHQR" style="height:18px;width:auto" />
          KHQR
        </div>
      </div>
      <div style="text-align:center;color:#9ca3af;font-size:11px;">Thank you for shopping with us! Visit us again at GenZ Vibe</div>
    </div>
  </div>
  <script>window.print(); setTimeout(() => window.close(), 300);<\/script>
  </body></html>`
  w.document.write(html)
  w.document.close()
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
}
</style>
