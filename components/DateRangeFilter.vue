<script setup lang="ts">
const props = defineProps<{ from: string; to: string; dark?: boolean }>()
const emit = defineEmits<{ change: [from: string, to: string] }>()

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const now = new Date()
const today = fmt(now)
const day = now.getDate()
const cycleStart = day >= 25
  ? new Date(now.getFullYear(), now.getMonth(), 25)
  : new Date(now.getFullYear(), now.getMonth() - 1, 25)
const thisMonthStart = fmt(new Date(now.getFullYear(), now.getMonth(), 1))
const lastMonthStart = fmt(new Date(now.getFullYear(), now.getMonth() - 1, 1))
const lastMonthEnd = fmt(new Date(now.getFullYear(), now.getMonth(), 0))

const presets = [
  { label: 'This cycle', from: fmt(cycleStart), to: today },
  { label: 'This month', from: thisMonthStart, to: today },
  { label: 'Last month', from: lastMonthStart, to: lastMonthEnd },
  { label: 'Last 30 days', from: fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)), to: today },
]

const showPicker = ref(false)
const localFrom = ref(props.from)
const localTo = ref(props.to)
const triggerRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref({})

watch(() => props.from, v => localFrom.value = v)
watch(() => props.to, v => localTo.value = v)

const openPicker = () => {
  if (triggerRef.value) {
    const rect = triggerRef.value.getBoundingClientRect()
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 8}px`,
      right: `${window.innerWidth - rect.right}px`,
      zIndex: 9999,
    }
  }
  showPicker.value = true
}

const apply = () => {
  emit('change', localFrom.value, localTo.value)
  showPicker.value = false
}

const applyPreset = (p: { from: string; to: string }) => {
  localFrom.value = p.from
  localTo.value = p.to
  emit('change', p.from, p.to)
  showPicker.value = false
}

const label = computed(() => {
  const f = new Date(props.from + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  const t = new Date(props.to + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })
  return `${f} – ${t}`
})
</script>

<template>
  <div class="relative">
    <button
      ref="triggerRef"
      @click="openPicker"
      :class="dark ? 'bg-white/10 border-white/10 text-white' : 'bg-[#1a1825] border-white/5 text-gray-300'"
      class="flex items-center gap-1.5 border rounded-xl px-3 py-1.5 text-xs font-medium shrink-0 transition hover:bg-white/20"
    >
      <svg class="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <span>{{ label }}</span>
      <svg class="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
    </button>

    <Teleport to="body">
      <template v-if="showPicker">
        <!-- Backdrop -->
        <div class="fixed inset-0 z-[9998]" @click="showPicker = false"></div>
        <!-- Dropdown -->
        <div :style="dropdownStyle" class="w-72 bg-[#1a1825] border border-white/10 rounded-2xl shadow-2xl p-4">
          <div class="grid grid-cols-2 gap-1.5 mb-3">
            <button
              v-for="p in presets" :key="p.label"
              @click="applyPreset(p)"
              :class="from === p.from && to === p.to ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'"
              class="px-2 py-1.5 rounded-xl text-xs font-medium transition text-center"
            >{{ p.label }}</button>
          </div>
          <div class="border-t border-white/5 pt-3 space-y-2">
            <div class="flex gap-2">
              <div class="flex-1">
                <p class="text-gray-500 text-xs mb-1">From</p>
                <input v-model="localFrom" type="date" class="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div class="flex-1">
                <p class="text-gray-500 text-xs mb-1">To</p>
                <input v-model="localTo" type="date" class="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
            </div>
            <button @click="apply" class="w-full bg-violet-600 hover:bg-violet-500 text-white py-2 rounded-xl text-xs font-semibold transition">Apply</button>
          </div>
        </div>
      </template>
    </Teleport>
  </div>
</template>
