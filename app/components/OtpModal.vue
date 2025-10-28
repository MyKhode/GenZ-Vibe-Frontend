<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
        <div class="relative z-10 bg-card rounded-3xl p-6 border border-border w-full max-w-md shadow-2xl">
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg font-bold text-foreground">{{ t('otp.payAndLogin') }}</h3>
            <button class="p-2 rounded-lg hover:bg-secondary" @click="$emit('close')">✕</button>
          </div>

          <p class="text-sm text-muted-foreground mb-4">{{ t('otp.enterCode') }}</p>

          <div class="space-y-3">
            <input 
              v-model="code"
              inputmode="numeric" 
              maxlength="4"
              class="w-full px-3 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest"
              :placeholder="t('otp.codePlaceholder')" />

            <div class="flex gap-2">
              <button class="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-xl disabled:opacity-60" :disabled="verifying || code.replace(/\D/g, '').length < 4" @click="onVerify">
                {{ verifying ? t('otp.verifying') : t('otp.verify') }}
              </button>
              <button 
                class="px-4 py-2 rounded-xl border border-border hover:bg-secondary disabled:opacity-60"
                :disabled="sending || cooldownLeft > 0"
                @click="onSend(true)"
              >
                <span v-if="cooldownLeft > 0">{{ t('otp.resend') }} ({{ cooldownLeft }}s)</span>
                <span v-else>{{ sending ? t('otp.sending') : t('otp.resend') }}</span>
              </button>
            </div>

            <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useApi } from '~/composables/useApi'

const props = defineProps<{ open: boolean; phone: string }>()
const emit = defineEmits<{ close: []; verified: [token: string] }>()

const { t } = useI18n()
const api = useApi()

const code = ref('')
const sending = ref(false)
const verifying = ref(false)
const cooldownLeft = ref(0)
const error = ref('')
let timer: any = null

const startCooldown = (seconds: number) => {
  cooldownLeft.value = Math.max(0, Math.floor(seconds))
  if (timer) clearInterval(timer)
  if (cooldownLeft.value > 0) {
    timer = setInterval(() => {
      cooldownLeft.value -= 1
      if (cooldownLeft.value <= 0) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  }
}

const onSend = async (isResend = false) => {
  if (!props.phone) return
  try {
    error.value = ''
    sending.value = true
    const res = await api.post('/auth/otp/send', { phone_number: props.phone })
    const data = await res.json().catch(() => ({} as any))
    // If backend returns cooldown on success or error, handle it
    if (!res.ok) {
      if (typeof data?.cooldown_left === 'number') {
        startCooldown(data.cooldown_left)
        error.value = `${(data?.message || data?.detail || 'Please wait')} (${data.cooldown_left}s)`
      } else {
        error.value = (data?.message || data?.detail || t('otp.sendFailed'))
      }
      return
    }
    if (typeof data?.cooldown_left === 'number') {
      startCooldown(data.cooldown_left)
    }
    if (!isResend) {
      // slight UX hint on first send
      // no alert spam; modal visible
    }
  } catch (e) {
    console.error(e)
    error.value = t('otp.sendFailed')
  } finally {
    sending.value = false
  }
}

const onVerify = async () => {
  if (!props.phone) return
  try {
    verifying.value = true
    error.value = ''
    const res = await api.post('/auth/otp/verify', { phone_number: props.phone, code: code.value })
    const data = await res.json().catch(() => ({} as any))
    if (!res.ok) {
      error.value = (data?.detail || data?.message || t('otp.verifyFailed'))
      return
    }
    emit('verified', data?.access_token || '')
  } catch (e) {
    console.error(e)
    error.value = t('otp.verifyFailed')
  } finally {
    verifying.value = false
  }
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    code.value = ''
    error.value = ''
    onSend(false)
  } else {
    if (timer) clearInterval(timer)
    timer = null
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
