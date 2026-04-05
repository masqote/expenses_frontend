<script setup lang="ts">
const props = defineProps<{ modelValue: string; dark?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const prev = () => {
  const [y, m] = props.modelValue.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  emit('update:modelValue', `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
}
const next = () => {
  const [y, m] = props.modelValue.split('-').map(Number)
  const d = new Date(y, m, 1)
  emit('update:modelValue', `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
}

// Short on mobile (Apr '26), full on desktop (April 2026)
const labelShort = computed(() => {
  const [y, m] = props.modelValue.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString('default', { month: 'short', year: '2-digit' })
})
const labelFull = computed(() => {
  const [y, m] = props.modelValue.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })
})
</script>

<template>
  <div
    :class="dark ? 'bg-white/10 border-white/10 text-white' : 'bg-[#1a1825] border-white/5 text-gray-300'"
    class="flex items-center gap-0.5 border rounded-xl px-1.5 py-1 shrink-0"
  >
    <button
      @click="prev"
      :class="dark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-white/5 text-gray-500'"
      class="w-6 h-6 flex items-center justify-center rounded-lg transition text-base leading-none"
    >‹</button>
    <!-- Mobile: short label -->
    <span class="sm:hidden text-xs font-medium w-14 text-center">{{ labelShort }}</span>
    <!-- Desktop: full label -->
    <span class="hidden sm:inline text-sm font-medium min-w-[120px] text-center">{{ labelFull }}</span>
    <button
      @click="next"
      :class="dark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-white/5 text-gray-500'"
      class="w-6 h-6 flex items-center justify-center rounded-lg transition text-base leading-none"
    >›</button>
  </div>
</template>
