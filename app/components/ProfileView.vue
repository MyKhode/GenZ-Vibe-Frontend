<template>
  <div>
    <h1 class="font-display text-4xl lg:text-5xl font-bold text-foreground mb-8">
      {{ t('profile.title') }}
    </h1>

    <div v-if="!isLoggedIn" class="text-center py-16">
      <UserCircle class="w-24 h-24 text-muted-foreground mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-foreground mb-2">{{ t('profile.loginRequired') }}</h2>
      <p class="text-muted-foreground mb-6">{{ t('profile.loginMessage') }}</p>
    </div>

    <div v-else class="max-w-2xl">
      <div class="bg-card rounded-2xl p-6 border border-border space-y-6">
        <!-- Profile Header -->
        <div class="flex items-center gap-4 pb-6 border-b border-border">
          <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <UserCircle class="w-12 h-12 text-primary" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-foreground">{{ profile?.full_name || t('profile.guest') }}</h2>
            <p class="text-muted-foreground">{{ profile?.phone_number || '' }}</p>
          </div>
        </div>

        <!-- Profile Form -->
        <div class="space-y-4">
          <div>
            <label for="profile-name" class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('profile.name') }}
            </label>
            <input 
              id="profile-name" 
              v-model="form.name" 
              type="text" 
              class="w-full px-4 py-3 rounded-lg border border-border bg-secondary/50 text-muted-foreground cursor-not-allowed"
              :placeholder="t('profile.phonePlaceholder')"
            />
            <p class="text-xs text-muted-foreground mt-1">{{ t('profile.phoneNote') }}</p>
          </div>

          <div>
            <label for="profile-address" class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('profile.address') }}
            </label>
            <input 
              id="profile-address" 
              v-model="form.address" 
              type="text" 
              class="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              :placeholder="t('profile.addressPlaceholder')"
            />
          </div>

          <div>
            <label for="profile-province" class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('profile.province') }}
            </label>
            <select 
              id="profile-province" 
              v-model="form.province" 
              class="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="" disabled>{{ t('profile.provincePlaceholder') }}</option>
              <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
        </div>

        <!-- Save Button -->
        <div class="pt-4 border-t border-border">
          <button 
            class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-colors"
            :disabled="saving"
            @click="saveProfile"
          >
            {{ saving ? t('profile.saving') : t('profile.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { UserCircle } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { useApi } from '~/composables/useApi'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()
const auth = useAuth()
const api = useApi()

const isLoggedIn = computed(() => !!auth.token.value)
const profile = computed(() => auth.profile.value)

const form = ref({
  name: '',
  phone: '',
  address: '',
  province: '',
})

const saving = ref(false)

const provinces = [
  'Banteay Meanchey', 'Battambang', 'Kampong Cham', 'Kampong Chhnang',
  'Kampong Speu', 'Kampong Thom', 'Kampot', 'Kandal', 'Kep', 'Koh Kong',
  'Kratié', 'Mondulkiri', 'Oddar Meanchey', 'Pailin', 'Preah Sihanouk',
  'Preah Vihear', 'Pursat', 'Prey Veng', 'Ratanakiri', 'Siem Reap',
  'Stung Treng', 'Svay Rieng', 'Takeo', 'Tbong Khmum',
]

const loadProfile = () => {
  if (profile.value) {
    form.value.name = profile.value.full_name || ''
    form.value.phone = profile.value.phone_number || ''
    form.value.address = profile.value.address || ''
    form.value.province = profile.value.province || ''
  }
}

const saveProfile = async () => {
  if (!form.value.name) {
    alert(t('profile.nameRequired'))
    return
  }
  
  saving.value = true
  try {
    const body = {
      full_name: form.value.name,
      address: form.value.address,
      province: form.value.province,
    }
    const res = await api.post('/user/me', body, { method: 'PUT' })
    if (!res.ok) throw new Error('Update failed')
    const updated = await res.json()
    auth.setProfile(updated)
    alert(t('profile.saved'))
  } catch (e) {
    console.error(e)
    alert(t('profile.saveFailed'))
  } finally {
    saving.value = false
  }
}

const fetchMe = async () => {
  try {
    const res = await api.get('/user/me')
    if (!res.ok) return
    const me = await res.json()
    auth.setProfile(me)
    loadProfile()
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  auth.loadFromStorage()
  if (isLoggedIn.value) {
    loadProfile()
    fetchMe()
  }
})

watch(() => profile.value, loadProfile)
</script>
