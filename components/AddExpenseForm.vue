<script setup lang="ts">
const props = defineProps<{ period: string }>()
const emit = defineEmits<{ submitted: []; cancel: [] }>()

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const { token } = useAuth()
const { categories, fetchCategories, createCategory } = useCategories()

const mode = ref<'form' | 'quick'>('form')
const selectedCategory = ref<number | null>(null)
const label = ref('')
const amount = ref('')
const quickInput = ref('')
const loading = ref(false)
const error = ref('')
const showNewCategory = ref(false)
const newCategoryName = ref('')
const newCategoryIcon = ref('')

onMounted(fetchCategories)

const submit = async () => {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'quick') {
      await $fetch(`${apiBase}/expenses`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
        body: { quick_input: quickInput.value, period: props.period },
      })
      quickInput.value = ''
    } else {
      if (!label.value.trim()) { error.value = 'Label is required'; loading.value = false; return }
      if (!amount.value || isNaN(Number(amount.value))) { error.value = 'Valid amount is required'; loading.value = false; return }
      await $fetch(`${apiBase}/expenses`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
        body: { label: label.value.trim(), amount: parseFloat(amount.value), period: props.period, category_id: selectedCategory.value },
      })
      label.value = ''
      amount.value = ''
      selectedCategory.value = null
    }
    emit('submitted')
  } catch (e: any) {
    error.value = e?.data?.message ?? e?.data?.errors?.quick_input?.[0] ?? 'Failed to add expense'
  } finally {
    loading.value = false
  }
}

const addCustomCategory = async () => {
  if (!newCategoryName.value.trim()) return
  try {
    const cat = await createCategory(newCategoryName.value.trim(), newCategoryIcon.value.trim() || undefined)
    selectedCategory.value = cat.id
    showNewCategory.value = false
    newCategoryName.value = ''
    newCategoryIcon.value = ''
  } catch (e: any) {
    error.value = e?.data?.errors?.name?.[0] ?? 'Failed to create category'
  }
}
</script>

<template>
  <div class="bg-[#1a1825] rounded-2xl border border-white/5 overflow-hidden">
    <!-- Header -->
    <div class="px-5 py-4 flex items-center justify-between border-b border-white/5">
      <h2 class="text-white font-semibold">New Expense</h2>
      <div class="flex items-center gap-2">
        <div class="flex gap-1 bg-white/5 rounded-xl p-1">
          <button @click="mode='form'" :class="mode==='form' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'" class="px-3 py-1 rounded-lg text-xs font-medium transition">Form</button>
          <button @click="mode='quick'" :class="mode==='quick' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'" class="px-3 py-1 rounded-lg text-xs font-medium transition">Quick</button>
        </div>
        <button @click="emit('cancel')" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <div class="p-5 space-y-4">
      <!-- Form mode -->
      <form v-if="mode === 'form'" @submit.prevent="submit" class="space-y-4">
        <!-- Category -->
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-2">Category</label>
          <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            <button v-for="cat in categories" :key="cat.id" type="button" @click="selectedCategory = cat.id"
              :class="selectedCategory === cat.id ? 'bg-violet-600 text-white border-violet-500' : 'bg-white/5 text-gray-400 border-white/10 hover:border-violet-500/50 hover:text-white'"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition"
            >
              <span v-if="cat.icon">{{ cat.icon }}</span>{{ cat.name }}
            </button>
            <button type="button" @click="showNewCategory = !showNewCategory"
              class="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-white/10 text-xs text-gray-500 hover:border-violet-500/50 hover:text-violet-400 transition"
            >+ New</button>
          </div>
          <div v-if="showNewCategory" class="mt-2 flex gap-2">
            <input v-model="newCategoryIcon" placeholder="😀" class="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white w-14 text-center focus:outline-none focus:ring-2 focus:ring-violet-500" maxlength="4" />
            <input v-model="newCategoryName" placeholder="Category name" class="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
            <button type="button" @click="addCustomCategory" class="bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-500 transition">Add</button>
          </div>
        </div>

        <input v-model="label" type="text" placeholder="Description (e.g. coffee, grab...)"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
        <input v-model="amount" type="number" min="1" step="any" placeholder="Amount (Rp)"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />

        <p v-if="error" class="text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2">{{ error }}</p>
        <button type="submit" :disabled="loading" class="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition shadow-lg shadow-violet-900/30">
          {{ loading ? 'Adding...' : 'Add Expense' }}
        </button>
      </form>

      <!-- Quick mode -->
      <form v-else @submit.prevent="submit" class="space-y-3">
        <input v-model="quickInput" type="text" placeholder="coffee : 15000"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
        <p class="text-xs text-gray-500">Also: <code class="text-violet-400">income label : amount</code> · <code class="text-violet-400">salary amount</code></p>
        <p v-if="error" class="text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2">{{ error }}</p>
        <button type="submit" :disabled="loading" class="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
          {{ loading ? 'Adding...' : 'Submit' }}
        </button>
      </form>
    </div>
  </div>
</template>
