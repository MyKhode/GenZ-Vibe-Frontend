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
            :src="theme.thumbnail" 
            :alt="theme.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Palette class="w-16 h-16 text-muted-foreground" />
          </div>
          <div class="absolute top-3 right-3">
            <span class="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
              {{ theme.category }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <h3 class="font-bold text-foreground text-xl mb-2">{{ theme.title }}</h3>
          <p class="text-muted-foreground text-sm mb-4">{{ theme.description }}</p>

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
import { ref, computed } from 'vue'
import { Download, Palette } from 'lucide-vue-next'
import { useThemeList } from '~/composables/useThemeList'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()
const { themes, categories, downloadTheme } = useThemeList()

const selectedCategory = ref('')
const downloading = ref<string | null>(null)

const filteredThemes = computed(() => {
  if (!selectedCategory.value) return themes
  return themes.filter(th => th.category === selectedCategory.value)
})

const handleDownload = async (theme: any) => {
  downloading.value = theme.id
  try {
    const success = await downloadTheme(theme.file, theme.id)
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
