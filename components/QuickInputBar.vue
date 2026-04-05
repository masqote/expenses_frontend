<script setup lang="ts">
const props = defineProps<{ period: string }>()
const emit = defineEmits<{ submitted: [] }>()

const { submit, error, loading } = useQuickInput()
const input = ref('')

const handleSubmit = async () => {
  if (!input.value.trim()) return
  try {
    await submit(input.value, props.period)
    input.value = ''
    emit('submitted')
  } catch {
    // error is set by useQuickInput
  }
}
</script>

<template>
  <div class="flex gap-2">
    <input
      v-model="input"
      @keydown.enter="handleSubmit"
      placeholder="coffee : 15000 or income bonus : 500000"
      class="flex-1 border rounded px-3 py-2 text-sm"
      :disabled="loading"
    />
    <button
      @click="handleSubmit"
      :disabled="loading"
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
    >
      Add
    </button>
  </div>
  <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
</template>
