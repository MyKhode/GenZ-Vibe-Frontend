<template>
  <div>
    <h1 class="font-display text-4xl lg:text-5xl font-bold text-foreground mb-8">
      {{ t('themes.title') }}
    </h1>

    <p class="text-muted-foreground mb-8">{{ t('themes.description') }}</p>

    <!-- Category Filter -->
    <div class="flex gap-2 mb-8 flex-wrap">
      <button 
        class="px-4 py-2 rounded-lg font-medium transition-colors"
        :class="selectedCategory === '' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'"
        @click="selectedCategory = ''"
      >
        {{ t('themes.all') }}
      </button>
      <button 
        v-for="cat in categories"
        :key="cat"
        class="px-4 py-2 rounded-lg font-medium transition-colors"
        :class="selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'"
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Themes Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="theme in filteredThemes"
        :key="theme.id"
        class="bg-card rounded-2xl border border-border overflow-hidden group"
      >
        <!-- Thumbnail -->
        <div class="aspect-video bg-secondary relative overflow-hidden">
          <img 
            v-if="theme.thumbnail" 
            :src="assetUrl(theme.thumbnail)" 
            :alt="theme.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Palette class="w-16 h-16 text-muted-foreground" />
          </div>
          <!-- Title overlay (top-left inside image) -->
          <div class="absolute top-3 left-3 max-w-[75%]">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-sm truncate inline-block">
              {{ theme.title }}
            </span>
          </div>
          <div class="absolute top-3 right-3">
            <span class="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
              {{ theme.category }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div class="flex items-start justify-between gap-3 mb-3">
            <p class="text-muted-foreground text-sm">{{ theme.description }}</p>
            <span class="text-xs text-muted-foreground shrink-0">Downloads: {{ theme.downloads || 0 }}</span>
          </div>
          <!-- Download Button -->
          <button 
            class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            :disabled="downloading === theme.id"
            @click="handleDownload(theme)"
          >
            <Download class="w-4 h-4" />
            {{ downloading === theme.id ? t('themes.downloading') : t('themes.download') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredThemes.length === 0" class="text-center py-16">
      <Palette class="w-24 h-24 text-muted-foreground mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-foreground mb-2">{{ t('themes.noThemes') }}</h2>
      <p class="text-muted-foreground">{{ t('themes.noThemesMessage') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Download, Palette } from 'lucide-vue-next'
import { fetchThemes } from '~/services/themes'
import { useRuntimeConfig } from '#app'
import type { ThemeItem } from '~/services/themes'
import { useI18n } from '~/composables/useI18n'
import { useApi } from '~/composables/useApi'

const { t } = useI18n()
const config = useRuntimeConfig()
const apiBase = (config.public as any)?.apiBase as string | undefined

const assetUrl = (p?: string) => {
  if (!p) return ''
  if (/^https?:\/\//i.test(p)) return p
  const path = p.startsWith('/') ? p.slice(1) : p
  if (apiBase) return apiBase.replace(/\/$/, '') + '/' + path
  return '/' + path
}
const themes = ref<ThemeItem[]>([])
const categories = ref<string[]>([])
const downloading = ref<string | null>(null)
const api = useApi()

onMounted(async () => {
  const items = await fetchThemes({ limit: 100 })
  themes.value = items
  categories.value = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[]
})

const selectedCategory = ref('')
const downloadTheme = async (themeFile: string, themeName: string) => {
  try {
    const response = await fetch(assetUrl(themeFile))
    if (!response.ok) throw new Error('Download failed')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${themeName}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

const filteredThemes = computed<ThemeItem[]>(() => {
  if (!selectedCategory.value) return themes.value
  return themes.value.filter((th: ThemeItem) => th.category === selectedCategory.value)
})

const handleDownload = async (theme: ThemeItem) => {
  downloading.value = theme.id
  try {
    // First, register the download with backend and get updated info
    let filePath = theme.file
    try {
      const res = await api.post(`/themes/${encodeURIComponent(theme.id)}/download`, {})
      if (res.ok) {
        const data = await res.json().catch(() => null)
        if (data) {
          ;(theme as any).downloads = data.downloads ?? (Number(theme.downloads || 0) + 1)
          filePath = data.file || filePath
        }
      }
    } catch {}

    const success = await downloadTheme(filePath, theme.id)
    if (success) {
      alert(t('themes.downloadSuccess').replace('{name}', theme.title))
    } else {
      alert(t('themes.downloadFailed'))
    }
  } finally {
    downloading.value = null
  }
}
</script>
