<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const { salary, fetchSalary, setSalary } = useSalary()
const period = ref(new Date().toISOString().slice(0, 7))
const amount = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

onMounted(() => fetchSalary(period.value))
watch(period, () => { fetchSalary(period.value); success.value = false })
watch(salary, (s) => { amount.value = s ? parseFloat(s.amount as any).toString() : '' })

const submit = async () => {
  error.value = ''
  success.value = false
  loading.value = true
  try {
    await setSalary(parseFloat(amount.value), period.value)
    success.value = true
  } catch (e: any) {
    error.value = e?.data?.errors?.amount?.[0] ?? e?.data?.message ?? 'Failed to set salary'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0f0e17]">
    <div class="bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 px-6 pt-8 pb-16 relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full"></div>
      <div class="relative flex items-center justify-between">
        <div class="min-w-0 flex-1 mr-3">
          <p class="text-blue-200 text-sm font-medium">Monthly Budget</p>
          <h1 class="text-2xl sm:text-3xl font-bold text-white mt-1 truncate">Salary</h1>
        </div>
        <PeriodNavigator v-model="period" dark />
      </div>
    </div>

    <div class="relative -mt-8 mx-4 space-y-4 max-w-lg lg:max-w-lg">
      <!-- Current -->
      <div v-if="salary" class="bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-2xl p-5">
        <p class="text-blue-300 text-xs font-medium uppercase tracking-wide mb-1">Current salary · {{ period }}</p>
        <p class="text-3xl font-bold text-white">Rp {{ parseFloat(salary.amount as any).toLocaleString('id-ID') }}</p>
      </div>
      <div v-else class="bg-[#1a1825] border border-white/5 rounded-2xl p-5 text-center">
        <p class="text-gray-500 text-sm">No salary set for {{ period }}</p>
      </div>

      <!-- Form -->
      <div class="bg-[#1a1825] rounded-2xl border border-white/5 p-5 space-y-4">
        <h2 class="text-white font-semibold">{{ salary ? 'Update Salary' : 'Set Salary' }}</h2>
        <form @submit.prevent="submit" class="space-y-3">
          <input v-model="amount" type="number" min="1" step="any" placeholder="e.g. 5000000"
            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <p v-if="error" class="text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2">{{ error }}</p>
          <p v-if="success" class="text-emerald-400 text-xs flex items-center gap-1">✓ Salary saved successfully</p>
          <button type="submit" :disabled="loading" class="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition shadow-lg shadow-blue-900/30">
            {{ loading ? 'Saving...' : salary ? 'Update' : 'Set Salary' }}
          </button>
        </form>
      </div>
      <div class="h-4"></div>
    </div>
  </div>
</template>
