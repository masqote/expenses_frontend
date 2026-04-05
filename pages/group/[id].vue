<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const groupId = Number(route.params.id)
const { groupSummary, groupExpenses, fetchGroupSummary, fetchGroupExpenses, removeMember } = useGroup()
const { token, user, fetchMe } = useAuth()
const config = useRuntimeConfig()
const period = ref(new Date().toISOString().slice(0, 7))

const loadAll = async () => {
  try {
    await Promise.all([
      fetchGroupSummary(groupId, period.value),
      fetchGroupExpenses(groupId, period.value),
    ])
  } catch (e: any) {
    if (e?.status === 403 || e?.response?.status === 403) {
      await navigateTo('/dashboard')
    }
  }
}

watch(period, loadAll)

// Load the user's groups list to check access
const myGroupsList = ref<{ id: number }[]>([])
const loadMyGroups = async () => {
  try {
    myGroupsList.value = await $fetch(`${config.public.apiBase}/groups/list`, {
      headers: { Authorization: `Bearer ${token.value}`, Accept: 'application/json' }
    }) as any[]
  } catch { myGroupsList.value = [] }
}

onMounted(async () => {
  await Promise.all([fetchMe(), loadMyGroups()])
  // Check if user has access to this specific group
  const hasAccess = myGroupsList.value.some((g: any) => g.id === groupId)
  if (!hasAccess) {
    await navigateTo('/dashboard')
    return
  }
  await loadAll()
})

const memberExpenses = (userId: number) =>
  groupExpenses.value.filter(e => e.user_id === userId) as any[]

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : `Rp ${Math.abs(n).toLocaleString('id-ID')}`

// Fetch group info to know owner
const groupInfo = ref<{ id: number; name: string; owner_id: number } | null>(null)
onMounted(async () => {
  try {
    groupInfo.value = await $fetch(`${config.public.apiBase}/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    }) as any
  } catch {}
})

const removingMember = ref<number | null>(null)
const handleRemoveMember = async (userId: number) => {
  if (!confirm('Remove this member from the group?')) return
  removingMember.value = userId
  try {
    await removeMember(groupId, userId)
    await loadAll()
  } catch (e: any) {
    alert(e?.data?.message ?? 'Failed to remove member')
  } finally {
    removingMember.value = null
  }
}
</script>

<template>
  <div class="bg-[#0f0e17] w-full overflow-x-hidden">

    <!-- Header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-fuchsia-700 via-purple-700 to-violet-800 px-6 pt-8 pb-16">
      <div class="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full"></div>

      <div class="relative flex items-center justify-between mb-4">
        <div class="min-w-0 flex-1 mr-3">
          <p class="text-fuchsia-200 text-sm font-medium">
            {{ groupInfo?.name ?? ('Group #' + groupId) }}
          </p>
          <h1 class="text-2xl sm:text-3xl font-bold text-white mt-1 truncate">Group Dashboard</h1>
        </div>
        <PeriodNavigator v-model="period" dark />
      </div>

      <!-- Group balance + member count -->
      <div class="relative grid grid-cols-2 gap-3" v-if="groupSummary">
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-2">
          <div class="min-w-0">
            <p class="text-white/60 text-xs">Group Balance</p>
            <p class="font-bold text-sm truncate" :class="(groupSummary.group_balance ?? 0) < 0 ? 'text-red-300' : 'text-white'">
              {{ groupSummary.group_balance != null ? (groupSummary.group_balance < 0 ? '-' : '') + fmt(groupSummary.group_balance) : '—' }}
            </p>
          </div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-2">
          <div class="min-w-0">
            <p class="text-white/60 text-xs">Members</p>
            <p class="text-white font-bold text-sm">{{ groupSummary.members.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="mx-4 mt-4 space-y-4">

      <!-- Loading -->
      <div v-if="!groupSummary" class="bg-[#1a1825] rounded-2xl border border-white/5 p-12 text-center">
        <div class="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
        <p class="text-gray-500 text-sm">Loading group data...</p>
      </div>

      <template v-else>
        <div v-if="groupSummary.members.length === 0" class="bg-[#1a1825] rounded-2xl border border-white/5 p-12 text-center">
          <p class="text-gray-500 text-sm">No members yet.</p>
        </div>

        <!-- Member cards -->
        <div
          v-for="member in groupSummary.members"
          :key="member.user_id"
          class="bg-[#1a1825] rounded-2xl border border-white/5 overflow-hidden"
        >
          <!-- Member header -->
          <div class="px-5 py-4 flex items-center gap-3 border-b border-white/5">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {{ member.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white font-semibold text-sm">{{ member.name }}</p>
              <p class="text-xs mt-0.5" :class="member.balance == null ? 'text-gray-500' : member.balance < 0 ? 'text-red-400' : 'text-emerald-400'">
                {{ member.balance == null ? 'Salary not set' : (member.balance < 0 ? '-' : '+') + fmt(member.balance) }}
              </p>
            </div>
            <!-- Remove button: only owner can remove, and can't remove themselves -->
            <button
              v-if="groupInfo && user && groupInfo.owner_id === user.id && member.user_id !== user.id"
              @click="handleRemoveMember(member.user_id)"
              :disabled="removingMember === member.user_id"
              class="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition disabled:opacity-50 shrink-0"
              title="Remove member"
            >
              <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/>
              </svg>
            </button>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-px bg-white/5">
            <div class="bg-[#1a1825] px-4 py-3 text-center">
              <p class="text-gray-500 text-xs mb-1">Salary</p>
              <p class="text-white text-sm font-semibold truncate">{{ fmt(member.salary) }}</p>
            </div>
            <div class="bg-[#1a1825] px-4 py-3 text-center">
              <p class="text-gray-500 text-xs mb-1">Income</p>
              <p class="text-emerald-400 text-sm font-semibold truncate">{{ fmt(member.total_income) }}</p>
            </div>
            <div class="bg-[#1a1825] px-4 py-3 text-center">
              <p class="text-gray-500 text-xs mb-1">Expenses</p>
              <p class="text-rose-400 text-sm font-semibold truncate">{{ fmt(member.total_expenses) }}</p>
            </div>
          </div>

          <!-- Expenses -->
          <div v-if="memberExpenses(member.user_id).length > 0">
            <div class="px-5 py-2.5 border-t border-white/5">
              <p class="text-gray-500 text-xs font-medium uppercase tracking-wide">Transactions</p>
            </div>
            <div
              v-for="e in memberExpenses(member.user_id)"
              :key="e.id"
              class="px-5 py-3 flex items-center gap-3 border-t border-white/5"
            >
              <div class="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-sm shrink-0">
                {{ e.category?.icon ?? '💸' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-white text-sm truncate">{{ e.label }}</p>
                <p class="text-gray-500 text-xs">{{ e.category?.name ?? 'Expense' }}</p>
              </div>
              <span class="text-rose-400 text-sm font-semibold shrink-0">
                -Rp {{ parseFloat(e.amount).toLocaleString('id-ID') }}
              </span>
            </div>
          </div>
          <div v-else class="px-5 py-5 text-center border-t border-white/5">
            <p class="text-gray-600 text-xs">No expenses this period</p>
          </div>
        </div>
      </template>

      <div class="h-4"></div>
    </div>
  </div>
</template>
