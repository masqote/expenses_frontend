<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const { expenses, fetchExpenses } = useExpenses()
const { incomes, fetchIncome } = useIncome()
const { fetchSummary, summary } = useSummary()
const { user, fetchMe } = useAuth()
const period = ref(new Date().toISOString().slice(0, 7))
const activeTab = ref<'expenses' | 'income'>('expenses')

const loadAll = async () => {
  await Promise.all([
    fetchExpenses(period.value),
    fetchIncome(period.value),
    fetchSummary(period.value),
  ])
}

watch(period, loadAll)
onMounted(async () => {
  await fetchMe()
  await loadAll()
})

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : `Rp ${Math.abs(n).toLocaleString('id-ID')}`
</script>

<template>
  <div class="bg-[#0f0e17] w-full max-w-full overflow-x-hidden">

    <!-- Hero header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 px-6 pt-8 pb-16">
      <div class="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full"></div>
      <div class="absolute top-16 -right-4 w-24 h-24 bg-white/5 rounded-full"></div>

      <div class="relative flex items-center justify-between mb-6">
        <div>
          <p class="text-violet-200 text-sm font-medium">
            {{ user ? 'Welcome back, ' + user.name.split(' ')[0] : 'Total Balance' }}
          </p>
          <h1 class="text-2xl sm:text-4xl font-bold text-white mt-1 tracking-tight truncate max-w-[200px] sm:max-w-none">
            <span v-if="summary?.balance != null" :class="summary.balance < 0 ? 'text-red-300' : 'text-white'">
              {{ summary.balance < 0 ? '-' : '' }}{{ fmt(summary.balance) }}
            </span>
            <span v-else class="text-white/50">—</span>
          </h1>
        </div>
        <PeriodNavigator v-model="period" dark />
      </div>

      <div class="relative grid grid-cols-2 gap-3">
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0">
            <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
          </div>
          <div class="min-w-0">
            <p class="text-white/60 text-xs">Income</p>
            <p class="text-white font-bold text-sm truncate">{{ fmt(summary?.total_income) }}</p>
          </div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-rose-400/20 flex items-center justify-center shrink-0">
            <svg class="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
          </div>
          <div class="min-w-0">
            <p class="text-white/60 text-xs">Expenses</p>
            <p class="text-white font-bold text-sm truncate">{{ fmt(summary?.total_expenses) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="mx-4 mt-4 space-y-4">

      <!-- Salary warning -->
      <div v-if="summary && !summary.salary" class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-amber-300 text-sm font-medium">Salary not set</p>
          <NuxtLink to="/salary" class="text-amber-400/70 text-xs hover:text-amber-300 transition">Set your salary →</NuxtLink>
        </div>
      </div>

      <!-- ── DESKTOP: side by side ── -->
      <div class="hidden lg:grid grid-cols-2 gap-4">
        <!-- Income column -->
        <div class="bg-[#1a1825] rounded-2xl border border-white/5 overflow-hidden">
          <div class="px-5 py-4 flex items-center justify-between border-b border-white/5">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
              </div>
              <h2 class="text-white font-semibold text-sm">Income</h2>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 text-xs">{{ incomes.length }} items</span>
              <NuxtLink to="/income" class="text-emerald-400 text-xs hover:text-emerald-300 transition">+ Add</NuxtLink>
            </div>
          </div>
          <div v-if="incomes.length === 0" class="px-5 py-10 text-center">
            <p class="text-gray-600 text-sm">No income yet</p>
            <NuxtLink to="/income" class="text-xs text-emerald-400 hover:text-emerald-300 mt-2 inline-block">Add income →</NuxtLink>
          </div>
          <div v-for="income in incomes" :key="income.id" class="px-5 py-3 flex items-center gap-3 border-b border-white/5 last:border-0">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-base shrink-0">💵</div>
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm truncate">{{ income.label }}</p>
              <p class="text-gray-500 text-xs">Income</p>
            </div>
            <span class="text-emerald-400 text-sm font-semibold shrink-0">+Rp {{ parseFloat(income.amount as any).toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <!-- Expenses column -->
        <div class="bg-[#1a1825] rounded-2xl border border-white/5 overflow-hidden">
          <div class="px-5 py-4 flex items-center justify-between border-b border-white/5">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
              </div>
              <h2 class="text-white font-semibold text-sm">Expenses</h2>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 text-xs">{{ expenses.length }} items</span>
              <NuxtLink to="/expenses" class="text-violet-400 text-xs hover:text-violet-300 transition">+ Add</NuxtLink>
            </div>
          </div>
          <div v-if="expenses.length === 0" class="px-5 py-10 text-center">
            <p class="text-gray-600 text-sm">No expenses yet</p>
            <NuxtLink to="/expenses" class="text-xs text-violet-400 hover:text-violet-300 mt-2 inline-block">Add expense →</NuxtLink>
          </div>
          <div v-for="expense in expenses" :key="expense.id" class="px-5 py-3 flex items-center gap-3 border-b border-white/5 last:border-0">
            <div class="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-base shrink-0">{{ expense.category?.icon ?? '💸' }}</div>
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm truncate">{{ expense.label }}</p>
              <p class="text-gray-500 text-xs">{{ expense.category?.name ?? 'Uncategorized' }}</p>
            </div>
            <span class="text-rose-400 text-sm font-semibold shrink-0">-Rp {{ parseFloat(expense.amount as any).toLocaleString('id-ID') }}</span>
          </div>
        </div>
      </div>

      <!-- ── MOBILE: tabs ── -->
      <div class="lg:hidden bg-[#1a1825] rounded-2xl border border-white/5 overflow-hidden">
        <!-- Tab bar -->
        <div class="flex border-b border-white/5">
          <button
            @click="activeTab = 'expenses'"
            :class="activeTab === 'expenses'
              ? 'text-white border-b-2 border-violet-500 bg-violet-500/5'
              : 'text-gray-500 border-b-2 border-transparent hover:text-gray-300'"
            class="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
            Expenses
            <span class="text-xs bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-full">{{ expenses.length }}</span>
          </button>
          <button
            @click="activeTab = 'income'"
            :class="activeTab === 'income'
              ? 'text-white border-b-2 border-emerald-500 bg-emerald-500/5'
              : 'text-gray-500 border-b-2 border-transparent hover:text-gray-300'"
            class="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
            Income
            <span class="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">{{ incomes.length }}</span>
          </button>
        </div>

        <!-- Expenses tab -->
        <div v-if="activeTab === 'expenses'">
          <div class="px-4 py-2.5 flex justify-end border-b border-white/5">
            <NuxtLink to="/expenses" class="text-xs text-violet-400 hover:text-violet-300 transition">+ Add expense</NuxtLink>
          </div>
          <div v-if="expenses.length === 0" class="px-5 py-10 text-center">
            <p class="text-gray-600 text-sm">No expenses yet</p>
          </div>
          <div v-for="expense in expenses" :key="expense.id" class="px-5 py-3 flex items-center gap-3 border-b border-white/5 last:border-0">
            <div class="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-base shrink-0">{{ expense.category?.icon ?? '💸' }}</div>
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm truncate">{{ expense.label }}</p>
              <p class="text-gray-500 text-xs">{{ expense.category?.name ?? 'Uncategorized' }}</p>
            </div>
            <span class="text-rose-400 text-sm font-semibold shrink-0">-Rp {{ parseFloat(expense.amount as any).toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <!-- Income tab -->
        <div v-if="activeTab === 'income'">
          <div class="px-4 py-2.5 flex justify-end border-b border-white/5">
            <NuxtLink to="/income" class="text-xs text-emerald-400 hover:text-emerald-300 transition">+ Add income</NuxtLink>
          </div>
          <div v-if="incomes.length === 0" class="px-5 py-10 text-center">
            <p class="text-gray-600 text-sm">No income yet</p>
          </div>
          <div v-for="income in incomes" :key="income.id" class="px-5 py-3 flex items-center gap-3 border-b border-white/5 last:border-0">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-base shrink-0">💵</div>
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm truncate">{{ income.label }}</p>
              <p class="text-gray-500 text-xs">Income</p>
            </div>
            <span class="text-emerald-400 text-sm font-semibold shrink-0">+Rp {{ parseFloat(income.amount as any).toLocaleString('id-ID') }}</span>
          </div>
        </div>
      </div>

      <div class="h-4"></div>
    </div>
  </div>
</template>
