<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const { expenses, fetchExpenses, updateExpense, deleteExpense } = useExpenses()
const { fetchSummary } = useSummary()
const period = ref(new Date().toISOString().slice(0, 7))
const showAddForm = ref(false)

const loadAll = async () => {
  await Promise.all([fetchExpenses(period.value), fetchSummary(period.value)])
}

watch(period, loadAll)
onMounted(loadAll)

const onSubmitted = () => { showAddForm.value = false; loadAll() }
const onExpenseUpdated = async (id: number, data: { label: string; amount: number }) => {
  await updateExpense(id, data)
}
const onExpenseDeleted = async (id: number) => {
  await deleteExpense(id)
}

const totalExpenses = computed(() =>
  expenses.value.reduce((sum, e) => sum + parseFloat(e.amount as any), 0)
)
const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`
</script>

<template>
  <div class="min-h-screen bg-[#0f0e17]">

    <!-- Header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-rose-700 via-pink-700 to-violet-800 px-6 pt-8 pb-16">
      <div class="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full"></div>
      <div class="absolute top-16 -right-4 w-24 h-24 bg-white/5 rounded-full"></div>

      <div class="relative flex items-center justify-between mb-4">
        <div class="min-w-0 flex-1 mr-3">
          <p class="text-rose-200 text-sm font-medium">Total Spent</p>
          <h1 class="text-2xl sm:text-4xl font-bold text-white mt-1 tracking-tight truncate">{{ fmt(totalExpenses) }}</h1>
        </div>
        <PeriodNavigator v-model="period" dark />
      </div>

      <!-- Count cards — single line -->
      <div class="relative grid grid-cols-2 gap-3">
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-2">
          <div class="min-w-0">
            <p class="text-white/60 text-xs">Transactions</p>
            <p class="text-white font-bold text-sm">{{ expenses.length }}</p>
          </div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-2">
          <div class="min-w-0">
            <p class="text-white/60 text-xs">Avg per item</p>
            <p class="text-white font-bold text-sm truncate">
              {{ expenses.length ? fmt(Math.round(totalExpenses / expenses.length)) : '—' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="mx-4 mt-4 space-y-4">

      <!-- Add button / form -->
      <div>
        <button
          v-if="!showAddForm"
          @click="showAddForm = true"
          class="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-900/40"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          Add Expense
        </button>
        <AddExpenseForm v-else :period="period" @submitted="onSubmitted" @cancel="showAddForm = false" />
      </div>

      <!-- Expense list -->
      <div class="bg-[#1a1825] rounded-2xl border border-white/5 overflow-hidden">
        <div class="px-5 py-4 flex items-center justify-between border-b border-white/5">
          <h2 class="text-white font-semibold">Expenses</h2>
          <span class="text-gray-500 text-xs">{{ expenses.length }} items</span>
        </div>

        <div v-if="expenses.length === 0" class="px-5 py-12 text-center">
          <div class="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </div>
          <p class="text-gray-500 text-sm">No expenses yet</p>
          <button @click="showAddForm = true" class="mt-3 text-xs text-violet-400 hover:text-violet-300 transition">+ Add your first expense</button>
        </div>

        <ExpenseRow
          v-for="expense in expenses"
          :key="expense.id"
          :expense="expense"
          @deleted="onExpenseDeleted"
          @updated="(id, data) => onExpenseUpdated(id, data)"
        />
      </div>

      <div class="h-4"></div>
    </div>
  </div>
</template>
