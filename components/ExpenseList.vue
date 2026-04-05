<script setup lang="ts">
import type { Expense } from '~/composables/useExpenses'

defineProps<{ expenses: Expense[] }>()
const emit = defineEmits<{ deleted: [id: number]; updated: [id: number, data: { label: string; amount: number }] }>()
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
    <h2 class="font-semibold text-gray-800 mb-4">Expenses</h2>
    <p v-if="expenses.length === 0" class="text-gray-400 text-sm text-center py-8">No expenses for this period.</p>
    <ExpenseRow
      v-for="expense in expenses"
      :key="expense.id"
      :expense="expense"
      @deleted="emit('deleted', $event)"
      @updated="(id, data) => emit('updated', id, data)"
    />
  </div>
</template>
