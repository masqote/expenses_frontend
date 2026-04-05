<script setup lang="ts">
const { token, expiresAt, loading, generateToken } = useTelegramLink()

const countdown = ref('')
let timer: ReturnType<typeof setInterval> | null = null

watch(expiresAt, (val) => {
  if (timer) clearInterval(timer)
  if (!val) return
  timer = setInterval(() => {
    const diff = Math.max(0, Math.floor((new Date(val).getTime() - Date.now()) / 1000))
    const m = Math.floor(diff / 60)
    const s = diff % 60
    countdown.value = `${m}:${String(s).padStart(2, '0')}`
    if (diff === 0) clearInterval(timer!)
  }, 1000)
})

onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <div>
    <button
      @click="generateToken"
      :disabled="loading"
      class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
    >
      🔗 Link Telegram
    </button>
    <div v-if="token" class="mt-2 p-3 bg-gray-100 rounded text-sm">
      <p class="font-medium">Send this to your Telegram bot:</p>
      <code class="block bg-white border rounded px-2 py-1 mt-1 select-all">/link {{ token }}</code>
      <p class="text-gray-500 text-xs mt-1">Expires in: {{ countdown }}</p>
    </div>
  </div>
</template>
