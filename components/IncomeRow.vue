<script setup lang="ts">
import type { Income } from '~/composables/useIncome'

const props = defineProps<{ income: Income }>()
const emit = defineEmits<{ deleted: [id: number]; updated: [id: number, data: { label: string; amount: number }] }>()

const editing = ref(false)
const editLabel = ref(props.income.label)
const editAmount = ref(parseFloat(props.income.amount as any))

const save = () => {
  emit('updated', props.income.id, { label: editLabel.value, amount: editAmount.value })
  editing.value = false
}
</script>

<template>
  <div class="px-5 py-3.5 border-b border-white/5 last:border-0">
    <div v-if="editing" class="space-y-2">
      <input v-model="editLabel" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
      <div class="flex gap-2">
        <input v-model.number="editAmount" type="number" class="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
        <button @click="save" class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition">Save</button>
        <button @click="editing = false" class="px-3 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white text-sm transition">✕</button>
      </div>
    </div>
    <div v-else class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg shrink-0">💵</div>
      <div class="flex-1 min-w-0">
        <p class="text-white text-sm font-medium truncate">{{ income.label }}</p>
        <p class="text-gray-500 text-xs mt-0.5">Income</p>
      </div>
      <span class="text-emerald-400 font-semibold text-sm shrink-0">+Rp {{ parseFloat(income.amount as any).toLocaleString('id-ID') }}</span>
      <div class="flex gap-1 shrink-0">
        <button @click="editing = true" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition">
          <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
        <button @click="emit('deleted', income.id)" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition">
          <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>
