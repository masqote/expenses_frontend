<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const { salaries, fetchSalaries, setSalary, deleteSalary } = useSalary()
const amount = ref('')
const salaryDate = ref(new Date().toISOString().slice(0, 10))
const loading = ref(false)
const success = ref(false)
const error = ref('')

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Fix timezone issue
const today = fmt(new Date())
salaryDate.value = today

onMounted(fetchSalaries)

const submit = async () => {
  error.value = ''
  success.value = false
  loading.value = true
  try {
    await setSalary(parseFloat(amount.value), salaryDate.value)
    success.value = true
    amount.value = ''
  } catch (e: any) {
    error.value = e?.data?.errors?.amount?.[0] ?? e?.data?.message ?? 'Failed to set salary'
  } finally {
    loading.value = false
  }
}

const handleDelete = async (period: string) => {
  if (!confirm('Remove this salary entry?')) return
  await deleteSalary(period)
}

const formatDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
</script>

<template>
  <div class="min-h-screen bg-[#0f0e17]">
    <div class="bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 px-6 pt-8 pb-16 relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full"></div>
      <div class="relative">
        <p class="text-blue-200 text-sm font-medium">Budget</p>
        <h1 class="text-2xl sm:text-3xl font-bold text-white mt-1">Salary</h1>
      </div>
    </div>

    <div class="relative -mt-8 mx-4 space-y-4 max-w-lg lg:max-w-lg">

      <!-- Add form -->
      <div class="bg-[#1a1825] rounded-2xl border border-white/5 p-5 space-y-3">
        <h2 class="text-white font-semibold">Add Salary Entry</h2>
        <form @submit.prevent="submit" class="space-y-3">
          <div class="flex gap-2">
            <input v-model="amount" type="number" min="1" step="any" placeholder="Amount (Rp)"
              class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <input v-model="salaryDate" type="date"
              class="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <p v-if="error" class="text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2">{{ error }}</p>
          <p v-if="success" class="text-emerald-400 text-xs">✓ Salary entry saved</p>
          <button type="submit" :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
            {{ loading ? 'Saving...' : 'Add Entry' }}
          </button>
        </form>
      </div>

      <!-- Salary list -->
      <div class="bg-[#1a1825] rounded-2xl border border-white/5 overflow-hidden">
        <div class="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 class="text-white font-semibold">Salary History</h2>
          <span class="text-gray-500 text-xs">{{ salaries.length }} entries</span>
        </div>
        <div v-if="salaries.length === 0" class="px-5 py-10 text-center">
          <p class="text-gray-500 text-sm">No salary entries yet</p>
        </div>
        <div v-for="s in salaries" :key="s.id" class="px-5 py-3.5 flex items-center gap-3 border-b border-white/5 last:border-0">
          <div class="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-sm font-medium">Rp {{ parseFloat(s.amount as any).toLocaleString('id-ID') }}</p>
            <p class="text-gray-500 text-xs mt-0.5">{{ formatDate(s.period) }}</p>
          </div>
          <button @click="handleDelete(s.period)"
            class="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition shrink-0">
            <svg class="w-3.5 h-3.5 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="h-4"></div>
    </div>
  </div>
</template>
