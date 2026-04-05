<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const { expenses, fetchExpenses } = useExpenses()
const { incomes, fetchIncome } = useIncome()
const { fetchSummary, summary } = useSummary()
const { user, fetchMe } = useAuth()
const { fromDate, toDate, setRange } = useDateRange()
const activeTab = ref<'expenses' | 'income'>('expenses')

const loadAll = async () => {
  await Promise.all([
    fetchExpenses(fromDate.value, toDate.value),
    fetchIncome(fromDate.value, toDate.value),
    fetchSummary(fromDate.value, toDate.value),
    fetchAdjustments(),
  ])
}

onMounted(async () => {
  await fetchMe()
  await loadAll()
})

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : `Rp ${Math.abs(n).toLocaleString('id-ID')}`

// ── Donut chart ──
const donutCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: any = null

const COLORS = ['#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#6366f1','#84cc16']

const categoryBreakdown = computed(() => {
  const map: Record<string, { name: string; icon: string; amount: number; color: string }> = {}
  expenses.value.forEach((e) => {
    const key = e.category?.name ?? 'Uncategorized'
    if (!map[key]) {
      map[key] = {
        name: key,
        icon: e.category?.icon ?? '💸',
        amount: 0,
        color: COLORS[Object.keys(map).length % COLORS.length]
      }
    }
    map[key].amount += parseFloat(e.amount as any)
  })
  return Object.values(map).sort((a, b) => b.amount - a.amount)
})

const renderChart = () => {
  if (!donutCanvas.value || categoryBreakdown.value.length === 0) return
  if (!(window as any).Chart) return
  if (chartInstance) chartInstance.destroy()
  const ctx = donutCanvas.value.getContext('2d')
  if (!ctx) return
  chartInstance = new (window as any).Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categoryBreakdown.value.map(c => c.name),
      datasets: [{
        data: categoryBreakdown.value.map(c => c.amount),
        backgroundColor: categoryBreakdown.value.map(c => c.color),
        borderWidth: 0,
        hoverOffset: 4,
      }]
    },
    options: {
      cutout: '65%',
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      responsive: false,
      maintainAspectRatio: false,
    }
  })
}

watch(categoryBreakdown, () => nextTick(renderChart))
onMounted(() => nextTick(renderChart))
onUnmounted(() => { if (chartInstance) chartInstance.destroy() })

// ── Adjustments ──
const { apiFetch } = useApi()
const adjustments = ref<{ id: number; amount: string; note: string | null; period: string; created_at: string }[]>([])
const showAdjModal = ref(false)
const adjAmount = ref('')
const adjNote = ref('')
const adjDate = ref(new Date().toISOString().slice(0, 10))
const adjLoading = ref(false)

const fetchAdjustments = async () => {
  try {
    adjustments.value = await apiFetch(`/adjustments?from=${fromDate.value}&to=${toDate.value}`)
  } catch { adjustments.value = [] }
}

const submitAdjustment = async () => {
  if (!adjAmount.value) return
  adjLoading.value = true
  try {
    await apiFetch('/adjustments', {
      method: 'POST',
      body: JSON.stringify({ amount: parseFloat(adjAmount.value), note: adjNote.value || null, period: adjDate.value }),
    })
    adjAmount.value = ''
    adjNote.value = ''
    showAdjModal.value = false
    await Promise.all([loadAll()])
  } finally {
    adjLoading.value = false
  }
}

const deleteAdjustment = async (id: number) => {
  if (!confirm('Delete this adjustment?')) return
  await apiFetch(`/adjustments/${id}`, { method: 'DELETE' })
  await loadAll()
}
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
          <h1 class="text-xl sm:text-4xl font-bold text-white mt-1 tracking-tight truncate max-w-[180px] sm:max-w-none">
            <span v-if="summary" :class="summary.balance < 0 ? 'text-red-300' : 'text-white'">
              {{ summary.balance < 0 ? '-' : '' }}{{ fmt(summary.balance) }}
            </span>
            <span v-else class="text-white/50">—</span>
          </h1>
        </div>
        <DateRangeFilter :from="fromDate" :to="toDate" dark @change="(f, t) => { setRange(f, t); loadAll() }" />
      </div>

      <div class="relative grid grid-cols-3 gap-2">
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
          <p class="text-white/60 text-xs">Income</p>
          <p class="text-emerald-300 font-bold text-xs sm:text-sm truncate mt-0.5">{{ fmt(summary?.total_income) }}</p>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
          <p class="text-white/60 text-xs">Expenses</p>
          <p class="text-rose-300 font-bold text-xs sm:text-sm truncate mt-0.5">{{ fmt(summary?.total_expenses) }}</p>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
          <p class="text-white/60 text-xs">Adjust</p>
          <p :class="(summary?.total_adjustments ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'" class="font-bold text-xs sm:text-sm truncate mt-0.5">
            {{ (summary?.total_adjustments ?? 0) >= 0 ? '+' : '-' }}{{ fmt(Math.abs(summary?.total_adjustments ?? 0)) }}
          </p>
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

      <!-- Donut chart -->
      <div v-if="expenses.length > 0" class="bg-[#1a1825] rounded-2xl border border-white/5 p-4">
        <h2 class="text-white font-semibold text-sm mb-3">Spending by Category</h2>
        <div class="flex flex-col sm:flex-row sm:items-center sm:gap-5">
          <!-- Chart: small on mobile, fixed on desktop -->
          <div class="flex justify-center mb-3 sm:mb-0 sm:shrink-0">
            <canvas ref="donutCanvas" width="120" height="120" style="width:120px;height:120px"></canvas>
          </div>
          <div class="flex-1 space-y-1.5">
            <div v-for="item in categoryBreakdown" :key="item.name" class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: item.color }"></div>
                <span class="text-gray-400 text-xs">{{ item.icon }} {{ item.name }}</span>
              </div>
              <span class="text-white text-xs font-medium">Rp {{ item.amount.toLocaleString('id-ID') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Adjustment button -->
      <button
        @click="showAdjModal = true"
        class="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-medium py-3 rounded-2xl flex items-center justify-center gap-2 transition"
      >
        <span class="text-base">⚖️</span>
        Balance Adjustment
      </button>

      <!-- Adjustments list -->
      <div v-if="adjustments.length > 0" class="bg-[#1a1825] rounded-2xl border border-white/5 overflow-hidden">
        <div class="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 class="text-white font-semibold text-sm flex items-center gap-2"><span>⚖️</span> Adjustments</h2>
          <span class="text-gray-500 text-xs">{{ adjustments.length }} items</span>
        </div>
        <div v-for="adj in adjustments" :key="adj.id" class="px-5 py-3 flex items-center gap-3 border-b border-white/5 last:border-0">
          <div class="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center text-base shrink-0">⚖️</div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-sm truncate">{{ adj.note || 'Balance adjustment' }}</p>
            <p class="text-gray-500 text-xs mt-0.5">{{ new Date(adj.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</p>
          </div>
          <span :class="parseFloat(adj.amount as any) >= 0 ? 'text-emerald-400' : 'text-rose-400'" class="text-sm font-semibold shrink-0">
            {{ parseFloat(adj.amount as any) >= 0 ? '+' : '' }}Rp {{ Math.abs(parseFloat(adj.amount as any)).toLocaleString('id-ID') }}
          </span>
          <button @click="deleteAdjustment(adj.id)" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition shrink-0">
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
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
              <p class="text-gray-500 text-xs">{{ new Date(income.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</p>
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
              <p class="text-gray-500 text-xs">{{ expense.category?.name ?? 'Uncategorized' }} · {{ new Date(expense.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}</p>
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
              <p class="text-gray-500 text-xs">{{ expense.category?.name ?? 'Uncategorized' }} · {{ new Date(expense.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}</p>
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
              <p class="text-gray-500 text-xs">{{ new Date(income.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</p>
            </div>
            <span class="text-emerald-400 text-sm font-semibold shrink-0">+Rp {{ parseFloat(income.amount as any).toLocaleString('id-ID') }}</span>
          </div>
        </div>
      </div>

      <div class="h-4"></div>
    </div>

    <!-- Adjustment modal -->
    <div v-if="showAdjModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div class="bg-[#1a1825] rounded-2xl border border-white/10 w-full max-w-sm p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-white font-semibold flex items-center gap-2"><span>⚖️</span> Balance Adjustment</h3>
          <button @click="showAdjModal = false" class="text-gray-500 hover:text-white transition">✕</button>
        </div>
        <p class="text-gray-400 text-xs">Positive = add money, negative = remove money. Creates an audit trail.</p>
        <input
          v-model="adjAmount"
          type="number"
          step="any"
          placeholder="Amount (e.g. 50000 or -50000)"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <input
          v-model="adjNote"
          type="text"
          placeholder="Note (e.g. Found cash in wallet)"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <input
          v-model="adjDate"
          type="date"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          @click="submitAdjustment"
          :disabled="adjLoading || !adjAmount"
          class="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition"
        >
          {{ adjLoading ? 'Saving...' : 'Apply Adjustment' }}
        </button>
      </div>
    </div>
  </div>
</template>
