<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const { incomes, fetchIncome, createIncome, updateIncome, deleteIncome } = useIncome()
const { fromDate, toDate, setRange } = useDateRange()
const label = ref('')
const amount = ref('')
const quickInput = ref('')
const incomeDate = ref(new Date().toISOString().slice(0, 10))
const mode = ref<'form' | 'quick'>('form')
const loading = ref(false)
const error = ref('')

onMounted(() => fetchIncome(fromDate.value, toDate.value))

const submit = async () => {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'quick') {
      await createIncome({ quick_input: quickInput.value, period: incomeDate.value })
      quickInput.value = ''
    } else {
      if (!label.value.trim()) { error.value = 'Label is required'; loading.value = false; return }
      if (!amount.value || isNaN(Number(amount.value))) { error.value = 'Valid amount is required'; loading.value = false; return }
      await createIncome({ label: label.value.trim(), amount: parseFloat(amount.value), period: incomeDate.value })
      label.value = ''
      amount.value = ''
    }
    await fetchIncome(fromDate.value, toDate.value)
  } catch (e: any) {
    error.value = e?.data?.message ?? e?.data?.errors?.quick_input?.[0] ?? 'Failed to add income'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0f0e17]">
    <!-- Header -->
    <div class="bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800 px-6 pt-8 pb-16 relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full"></div>
      <div class="relative flex items-center justify-between">
        <div class="min-w-0 flex-1 mr-3">
          <p class="text-emerald-200 text-sm font-medium">Ad-hoc Income</p>
          <h1 class="text-2xl sm:text-3xl font-bold text-white mt-1 truncate">Income</h1>
        </div>
        <DateRangeFilter :from="fromDate" :to="toDate" dark @change="(f, t) => { setRange(f, t); fetchIncome(f, t) }" />
      </div>
    </div>

    <div class="relative -mt-8 mx-4 space-y-4">
      <!-- Add form -->
      <div class="bg-[#1a1825] rounded-2xl border border-white/5 overflow-hidden">
        <div class="px-5 py-4 flex items-center justify-between border-b border-white/5">
          <h2 class="text-white font-semibold">Add Income</h2>
          <div class="flex gap-1 bg-white/5 rounded-xl p-1">
            <button @click="mode='form'" :class="mode==='form'?'bg-emerald-600 text-white':'text-gray-400 hover:text-white'" class="px-3 py-1 rounded-lg text-xs font-medium transition">Form</button>
            <button @click="mode='quick'" :class="mode==='quick'?'bg-emerald-600 text-white':'text-gray-400 hover:text-white'" class="px-3 py-1 rounded-lg text-xs font-medium transition">Quick</button>
          </div>
        </div>
        <form @submit.prevent="submit" class="p-5 space-y-3">
          <template v-if="mode==='form'">
            <input v-model="label" placeholder="Label (e.g. freelance, bonus)" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
            <div class="flex gap-2">
              <input v-model="amount" type="number" min="1" placeholder="Amount (Rp)" class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
              <input v-model="incomeDate" type="date" class="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </template>
          <template v-else>
            <input v-model="quickInput" placeholder="income freelance : 500000" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <input v-model="incomeDate" type="date" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <p class="text-xs text-gray-500">Format: <code class="text-emerald-400">income label : amount</code></p>
          </template>
          <p v-if="error" class="text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2">{{ error }}</p>
          <button type="submit" :disabled="loading" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition shadow-lg shadow-emerald-900/30">
            {{ loading ? 'Adding...' : 'Add Income' }}
          </button>
        </form>
      </div>

      <!-- List -->
      <div class="bg-[#1a1825] rounded-2xl border border-white/5 overflow-hidden">
        <div class="px-5 py-4 flex items-center justify-between border-b border-white/5">
          <h2 class="text-white font-semibold">Entries</h2>
          <span class="text-gray-500 text-xs">{{ incomes.length }} items</span>
        </div>
        <div v-if="incomes.length === 0" class="px-5 py-12 text-center">
          <p class="text-gray-500 text-sm">No income entries for this period.</p>
        </div>
        <IncomeRow
          v-for="income in incomes"
          :key="income.id"
          :income="income"
          @deleted="async (id) => { await deleteIncome(id); await fetchIncome(fromDate, toDate) }"
          @updated="async (id, data) => { await updateIncome(id, data); await fetchIncome(fromDate, toDate) }"
        />
      </div>
      <div class="h-4"></div>
    </div>
  </div>
</template>
