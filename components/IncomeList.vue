<script setup lang="ts">
import type { Income } from '~/composables/useIncome'

defineProps<{ incomes: Income[] }>()
const emit = defineEmits<{ deleted: [id: number]; updated: [id: number, data: { label: string; amount: number }] }>()
</script>

<template>
  <div class="bg-white rounded shadow p-4">
    <h3 class="font-semibold mb-2">Income</h3>
    <p v-if="incomes.length === 0" class="text-gray-400 text-sm">No income entries yet.</p>
    <IncomeRow
      v-for="income in incomes"
      :key="income.id"
      :income="income"
      @deleted="emit('deleted', $event)"
      @updated="emit('updated', $event[0], $event[1])"
    />
  </div>
</template>
