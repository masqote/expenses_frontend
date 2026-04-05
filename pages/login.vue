<script setup lang="ts">
definePageMeta({ middleware: ['guest'], layout: false })

const { login } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const submit = async () => {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    await navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Invalid credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0f0e17] flex items-center justify-center p-4">
    <!-- Background glow -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-3xl shadow-2xl shadow-purple-900/50 mx-auto mb-4">₿</div>
        <h1 class="text-2xl font-bold text-white">Welcome back</h1>
        <p class="text-gray-500 text-sm mt-1">Sign in to BudgetTrack</p>
      </div>

      <div class="bg-[#1a1825] rounded-2xl border border-white/5 p-6 space-y-4">
        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
            <input v-model="email" type="email" required autocomplete="email" placeholder="you@example.com"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
            <input v-model="password" type="password" required autocomplete="current-password" placeholder="••••••••"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition" />
          </div>

          <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{{ error }}</div>

          <button type="submit" :disabled="loading"
            class="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition shadow-lg shadow-violet-900/30 mt-2">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 pt-2 border-t border-white/5">
          No account?
          <NuxtLink to="/register" class="text-violet-400 font-medium hover:text-violet-300 transition">Create one</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
