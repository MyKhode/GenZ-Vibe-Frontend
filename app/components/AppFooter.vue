<template>
  <footer class="bg-card rounded-xl border-t border-border mt-auto pb-16 lg:pb-0">
    <div class="container mx-auto max-w-7xl px-4 py-8">
      <div class="flex flex-col items-center gap-4 text-center">
        <!-- Contact Info -->
        <div class="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground">
          <span>Tel: 096-407-4300</span>
          <span class="hidden sm:inline">•</span>
          <a 
            href="https://t.me/soytet" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-primary hover:underline inline-flex items-center gap-1"
          >
            <Send class="w-4 h-4" />
            Telegram (Click here)
          </a>
        </div>

        <!-- Copyright -->
        <p class="text-sm text-muted-foreground">
          Copyright© 2025, GenZ Vibe
        </p>

        <!-- Payment & Logistics -->
        <div class="flex items-center gap-3">
          <p class="text-xs text-muted-foreground font-medium">We accept:</p>
          <div class="flex items-center gap-2 flex-wrap justify-center">
            <img src="/images/khqr.jpg" alt="KHQR Payment" class="h-6 w-auto rounded-sm object-contain" />
            <img src="/images/vireak-buntham.png" alt="Logistics Partner" class="h-6 w-auto object-contain" />
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Send } from 'lucide-vue-next'
</script>
