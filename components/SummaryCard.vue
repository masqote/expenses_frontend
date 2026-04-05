<script setup lang="ts">
defineProps<{
  title: string
  value: number | null | undefined
  icon: string
  color?: string
  negative?: boolean
}>()

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : `Rp ${n.toLocaleString('id-ID')}`
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
    <div class="flex items-center justify-between mb-3">
      <span class="text-2xl">{{ icon }}</span>
      <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">{{ title }}</span>
    </div>
    <p class="text-xl font-bold" :class="negative ? 'text-red-600' : 'text-gray-900'">
      {{ fmt(value) }}
    </p>
  </div>
</template>
