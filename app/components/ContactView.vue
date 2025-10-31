<template>
  <div>
    <h1 class="font-display text-4xl lg:text-5xl font-bold text-foreground mb-8">
      Contact <span class="text-primary">Us</span>
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      <!-- Contact Form -->
      <div class="bg-card rounded-2xl p-6 lg:p-8 border border-border">
        <h2 class="text-2xl font-bold text-foreground mb-6">Send us a message</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-foreground mb-2">Full name</label>
            <input 
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-3 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-foreground mb-2">Telegram or phone number</label>
            <input 
              v-model="form.telegram"
              type="text"
              required
              class="w-full px-4 py-3 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="@username or 012345678"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-foreground mb-2">Message</label>
            <textarea 
              v-model="form.message"
              required
              rows="5"
              class="w-full px-4 py-3 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Tell us more..."
            />
          </div>

          <button 
            type="submit"
            :disabled="sending"
            class="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-bold py-4 rounded-xl transition-colors text-sm uppercase tracking-wide"
          >
            {{ sending ? 'Sending…' : 'Send Message' }}
          </button>
        </form>

        <!-- Feedback is shown via toasts -->
      </div>

      <!-- Contact Information -->
      <div class="space-y-6">
        <!-- Contact Details -->
        <div class="bg-card rounded-2xl p-6 lg:p-8 border border-border">
          <h2 class="text-2xl font-bold text-foreground mb-6">Get in touch</h2>
          
          <div class="space-y-4">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail class="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 class="font-semibold text-foreground mb-1">Email</h3>
                <p class="text-muted-foreground text-sm">ikhode.station@gmail.com</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone class="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 class="font-semibold text-foreground mb-1">Phone</h3>
                <p class="text-muted-foreground text-sm">096 407 4300</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin class="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 class="font-semibold text-foreground mb-1">Address</h3>
                <p class="text-muted-foreground text-sm">SOY TET<br>st. 04, n.12, Phnom Penh City, Cambodia, 121203</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Social Media -->
        <div class="bg-card rounded-2xl p-6 lg:p-8 border border-border">
          <h2 class="text-2xl font-bold text-foreground mb-6">Follow us</h2>
          <div class="flex flex-wrap gap-3">
            <a class="px-4 h-12 inline-flex items-center gap-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors text-primary"
               href="https://facebook.com/genzvibe" target="_blank" rel="noopener">
              <span class="font-medium">Facebook</span>
              <span class="text-muted-foreground">@genzvibe</span>
            </a>
            <a class="px-4 h-12 inline-flex items-center gap-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors text-primary"
               href="https://tiktok.com/@genzvibe" target="_blank" rel="noopener">
              <span class="font-medium">TikTok</span>
              <span class="text-muted-foreground">@genzvibe</span>
            </a>
            <a class="px-4 h-12 inline-flex items-center gap-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors text-primary"
               href="https://youtube.com/@genzvibe" target="_blank" rel="noopener">
              <span class="font-medium">YouTube</span>
              <span class="text-muted-foreground">@genzvibe</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Mail, Phone, MapPin } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { useNotify } from '~/composables/useNotify'

const form = ref({
  name: '',
  telegram: '',
  message: ''
})

const submitStatus = ref<'idle' | 'success' | 'error'>('idle')
const sending = ref(false)

const { post } = useApi()
const notify = useNotify()

const handleSubmit = async () => {
  try {
    sending.value = true
    submitStatus.value = 'idle'
    const payload = {
      name: form.value.name.trim(),
      telegram: form.value.telegram.trim(),
      message: form.value.message.trim(),
    }
    const res = await post('/contact/', payload)
    let data: any = null
    try { data = await res.json() } catch {}

    // Handle cooldown specifically if provided by API
    if (data && data.status === 'cooldown_active') {
      const left = Number(data.cooldown_left ?? 0)
      notify.warning(`Cooldown active — try again in ${left}s`, 'Please wait')
      submitStatus.value = 'idle'
      return
    }

    if (res.ok) {
      submitStatus.value = 'success'
      notify.success('We will get back to you soon.', 'Message sent')
      form.value = { name: '', telegram: '', message: '' }
    } else {
      submitStatus.value = 'error'
      notify.error('Please try again shortly.', 'Failed to send')
    }
  } catch (e) {
    submitStatus.value = 'error'
    notify.error('Unexpected error occurred.', 'Error')
  } finally {
    sending.value = false
    setTimeout(() => { if (submitStatus.value !== 'idle') submitStatus.value = 'idle' }, 3000)
  }
}
</script>
