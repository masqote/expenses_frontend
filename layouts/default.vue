<script setup lang="ts">
const { logout, user, fetchMe, token } = useAuth()
const { pendingInvites, fetchPendingInvites } = useGroup()
const route = useRoute()

onMounted(fetchPendingInvites)

const { userGroup, refreshUserGroup } = useUserGroup()
const myGroupsList = ref<{ id: number; name: string; is_owner: boolean }[]>([])

const loadSidebarGroups = async () => {
  if (!token.value) return
  try {
    myGroupsList.value = await $fetch(`${useRuntimeConfig().public.apiBase}/groups/list`, {
      headers: { Authorization: `Bearer ${token.value}`, Accept: 'application/json' }
    }) as any[]
  } catch { myGroupsList.value = [] }
}

onMounted(async () => {
  await Promise.all([refreshUserGroup(), fetchMe(), loadSidebarGroups()])
})

// Re-check group membership on every navigation
watch(() => route.path, async () => {
  await Promise.all([refreshUserGroup(), loadSidebarGroups()])
})

const navItems = [
  { label: 'Dashboard', icon: 'home', to: '/dashboard' },
  { label: 'Expenses', icon: 'shopping-cart', to: '/expenses' },
  { label: 'Income', icon: 'trending-up', to: '/income' },
  { label: 'Salary', icon: 'briefcase', to: '/salary' },
  { label: 'Groups', icon: 'users', to: '/invites', badge: computed(() => pendingInvites.value.length) },
]

const isActive = (path: string) => route.path === path || (path !== '/dashboard' && route.path.startsWith(path))

const handleLogout = async () => {
  await logout()
  userGroup.value = null
  myGroupsList.value = []
  await navigateTo('/login')
}

const { token: tgToken, expiresAt, loading: tgLoading, generateToken } = useTelegramLink()
const showTgPanel = ref(false)
const tgCountdown = ref('')
let tgTimer: ReturnType<typeof setInterval> | null = null

watch(expiresAt, (val) => {
  if (tgTimer) clearInterval(tgTimer)
  if (!val) return
  tgTimer = setInterval(() => {
    const diff = Math.max(0, Math.floor((new Date(val).getTime() - Date.now()) / 1000))
    const h = Math.floor(diff / 3600)
    const m = Math.floor((diff % 3600) / 60)
    tgCountdown.value = h > 0 ? `${h}h ${m}m` : `${m}m`
    if (diff === 0) clearInterval(tgTimer!)
  }, 1000)
})
onUnmounted(() => { if (tgTimer) clearInterval(tgTimer) })

const handleTelegramLink = async () => {
  showTgPanel.value = !showTgPanel.value
  if (showTgPanel.value && !tgToken.value) await generateToken()
}
</script>

<template>
  <div class="flex min-h-screen bg-[#0f0e17] overflow-x-hidden">

    <!-- Sidebar (desktop) -->
    <aside class="hidden lg:flex flex-col w-64 bg-[#1a1825] border-r border-white/5 fixed top-0 left-0 h-full z-20">
      <!-- Logo + user -->
      <div class="px-6 py-5 border-b border-white/5">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-900/40">₿</div>
          <span class="font-bold text-white text-base tracking-tight">BudgetTrack</span>
        </div>
        <div v-if="user" class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-violet-500/30 flex items-center justify-center text-violet-300 font-bold text-xs shrink-0">
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <p class="text-white text-xs font-medium truncate">{{ user.name }}</p>
            <p class="text-gray-500 text-xs truncate">{{ user.email }}</p>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="isActive(item.to)
            ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
            : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'"
          class="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all"
        >
          <span class="flex items-center gap-3">
            <svg v-if="item.icon==='home'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <svg v-if="item.icon==='shopping-cart'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <svg v-if="item.icon==='trending-up'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            <svg v-if="item.icon==='briefcase'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <svg v-if="item.icon==='users'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            {{ item.label }}
          </span>
          <span v-if="item.badge && item.badge.value > 0" class="bg-violet-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{{ item.badge.value }}</span>
        </NuxtLink>

        <!-- Group links -->
        <NuxtLink
          v-for="group in myGroupsList"
          :key="group.id"
          :to="`/group/${group.id}`"
          :class="route.path === `/group/${group.id}` ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span class="truncate">{{ group.name }}</span>
        </NuxtLink>
      </nav>

      <!-- Footer -->
      <div class="px-3 py-4 border-t border-white/5 space-y-1">
        <button @click="handleTelegramLink" :disabled="tgLoading" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all text-left disabled:opacity-50">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.613c-.15.67-.54.835-1.094.52l-3.02-2.226-1.46 1.404c-.16.16-.296.296-.608.296l.216-3.073 5.59-5.05c.243-.216-.053-.336-.376-.12L7.37 14.41l-2.97-.928c-.645-.2-.658-.645.135-.955l11.59-4.47c.537-.196 1.007.13.837.19z"/></svg>
          {{ tgLoading ? 'Generating...' : 'Link Telegram' }}
        </button>

        <div v-if="showTgPanel && tgToken" class="mx-1 p-3 bg-violet-900/30 border border-violet-500/20 rounded-xl text-xs space-y-2">
          <p class="font-medium text-violet-300">Send to your bot:</p>
          <code class="block bg-black/30 border border-violet-500/20 rounded-lg px-2 py-2 text-violet-200 select-all break-all font-mono">/link {{ tgToken }}</code>
          <p class="text-violet-400">Expires: {{ tgCountdown }}</p>
        </div>

        <button @click="handleLogout" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-left">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Logout
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0 overflow-x-hidden">

      <!-- Mobile top bar -->
      <header class="lg:hidden fixed top-0 left-0 right-0 bg-[#1a1825]/90 backdrop-blur-sm border-b border-white/5 z-20 flex items-center justify-between px-4" style="height: 48px; padding-top: env(safe-area-inset-top, 0px)">
        <span class="text-white font-bold text-sm tracking-tight">BudgetTrack</span>
        <div class="flex items-center gap-2">
          <span v-if="user" class="text-gray-400 text-xs">{{ user.name.split(' ')[0] }}</span>
          <button @click="handleLogout" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition">
            <svg class="w-4 h-4 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Mobile bottom nav -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1a1825] border-t border-white/5 z-20 flex" style="padding-bottom: env(safe-area-inset-bottom, 0px)">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to"
          :class="isActive(item.to) ? 'text-violet-400' : 'text-gray-500'"
          class="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium relative"
        >
          <svg v-if="item.icon==='home'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <svg v-if="item.icon==='shopping-cart'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          <svg v-if="item.icon==='trending-up'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          <svg v-if="item.icon==='briefcase'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <svg v-if="item.icon==='users'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          <span>{{ item.label }}</span>
          <span v-if="item.badge && item.badge.value > 0" class="absolute top-2 right-1/4 bg-violet-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{{ item.badge.value }}</span>
        </NuxtLink>
      </nav>

      <main class="flex-1 overflow-y-auto overflow-x-hidden w-full" style="padding-top: 48px; padding-bottom: calc(4rem + env(safe-area-inset-bottom, 0px))">
        <slot />
      </main>
    </div>
  </div>
</template>
