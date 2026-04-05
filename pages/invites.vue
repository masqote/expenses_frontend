<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const { pendingInvites, fetchPendingInvites, acceptInvite, declineInvite, createGroup, sendInvite } = useGroup()
const { refreshUserGroup } = useUserGroup()
const { user, fetchMe, token } = useAuth()
const config = useRuntimeConfig()

interface GroupItem { id: number; name: string; is_owner: boolean; member_count: number | null }

const myGroups = ref<GroupItem[]>([])
const newGroupName = ref('')
const groupError = ref('')
const inviteEmail = ref('')
const inviteGroupId = ref<number | null>(null)
const inviteError = ref('')
const inviteSuccess = ref('')

const loadGroups = async () => {
  try {
    const result = await $fetch<GroupItem[]>(`${config.public.apiBase}/groups/list`, {
      headers: { Authorization: `Bearer ${token.value}`, Accept: 'application/json' }
    })
    myGroups.value = result
  } catch (e) {
    console.error('loadGroups error:', e)
    myGroups.value = []
  }
}

onMounted(async () => {
  await Promise.all([fetchPendingInvites(), fetchMe(), loadGroups()])
})

// Re-load when navigating back to this page
onActivated(loadGroups)

const handleCreateGroup = async () => {
  groupError.value = ''
  try {
    await createGroup(newGroupName.value)
    newGroupName.value = ''
    await Promise.all([loadGroups(), refreshUserGroup()])
  } catch (e: any) {
    groupError.value = e?.data?.message ?? 'Failed to create group'
  }
}

const handleSendInvite = async () => {
  inviteError.value = ''
  inviteSuccess.value = ''
  if (!inviteGroupId.value) { inviteError.value = 'Select a group first'; return }
  if (!inviteEmail.value) { inviteError.value = 'Enter an email'; return }
  try {
    await sendInvite(inviteGroupId.value, inviteEmail.value)
    inviteSuccess.value = 'Invite sent to ' + inviteEmail.value
    inviteEmail.value = ''
  } catch (e: any) {
    inviteError.value = e?.data?.message ?? 'Failed to send invite'
  }
}

const handleAccept = async (id: number) => {
  await acceptInvite(id)
  await Promise.all([fetchPendingInvites(), loadGroups(), refreshUserGroup()])
}

const handleDecline = async (id: number) => {
  await declineInvite(id)
  await fetchPendingInvites()
}

const ownedGroups = computed(() => myGroups.value.filter(g => g.is_owner))
</script>

<template>
  <div class="min-h-screen bg-[#0f0e17]">
    <div class="bg-gradient-to-br from-purple-700 via-violet-700 to-indigo-800 px-6 pt-8 pb-16 relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full"></div>
      <div class="relative">
        <p class="text-purple-200 text-sm font-medium">Manage</p>
        <h1 class="text-2xl sm:text-3xl font-bold text-white mt-1">Groups & Invites</h1>
      </div>
    </div>

    <div class="relative -mt-8 mx-4 space-y-4 max-w-2xl">

      <!-- 1. Create Group -->
      <div class="bg-[#1a1825] rounded-2xl border border-white/5 p-5">
        <h2 class="text-white font-semibold mb-4">Create a Group</h2>
        <form @submit.prevent="handleCreateGroup" class="flex flex-col sm:flex-row gap-3">
          <input
            v-model="newGroupName"
            placeholder="Group name (e.g. Household)"
            class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
          <button type="submit" class="bg-violet-600 hover:bg-violet-500 text-white px-5 py-3 rounded-xl text-sm font-semibold transition">
            Create
          </button>
        </form>
        <p v-if="groupError" class="text-red-400 text-xs mt-2 bg-red-500/10 rounded-xl px-3 py-2">{{ groupError }}</p>
      </div>

      <!-- 2. My Groups list -->
      <div class="bg-[#1a1825] rounded-2xl border border-white/5 overflow-hidden">
        <div class="px-5 py-4 border-b border-white/5">
          <h2 class="text-white font-semibold">My Groups</h2>
        </div>
        <div v-if="myGroups.length === 0" class="px-5 py-10 text-center">
          <p class="text-gray-500 text-sm">No groups yet. Create one above.</p>
        </div>
        <div
          v-for="group in myGroups"
          :key="group.id"
          class="px-5 py-4 flex items-center justify-between border-b border-white/5 last:border-0"
        >
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {{ group.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-white font-medium text-sm">{{ group.name }}</p>
              <p class="text-gray-500 text-xs mt-0.5">
                {{ group.is_owner ? 'Owner' : 'Member' }}
                <span v-if="group.member_count != null"> · {{ group.member_count }} members</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="group.is_owner"
              @click="inviteGroupId = group.id"
              :class="inviteGroupId === group.id ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'"
              class="px-3 py-1.5 rounded-xl text-xs font-medium transition"
            >
              {{ inviteGroupId === group.id ? '✓ Selected' : 'Invite' }}
            </button>
            <NuxtLink
              :to="`/group/${group.id}`"
              class="bg-violet-600/20 border border-violet-500/30 text-violet-300 px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-violet-600/30 transition"
            >
              View →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 3. Invite Form (only if user owns at least one group) -->
      <div v-if="ownedGroups.length > 0" class="bg-[#1a1825] rounded-2xl border border-white/5 p-5">
        <h2 class="text-white font-semibold mb-1">Invite Someone</h2>
        <p class="text-gray-500 text-xs mb-4">
          {{ inviteGroupId ? 'Inviting to: ' + (myGroups.find(g => g.id === inviteGroupId)?.name ?? '') : 'Select a group above first' }}
        </p>
        <form @submit.prevent="handleSendInvite" class="space-y-3">
          <input
            v-model="inviteEmail"
            type="email"
            placeholder="Email address"
            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
          <p v-if="inviteError" class="text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2">{{ inviteError }}</p>
          <p v-if="inviteSuccess" class="text-emerald-400 text-xs">✓ {{ inviteSuccess }}</p>
          <button
            type="submit"
            :disabled="!inviteGroupId"
            class="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl text-sm font-semibold transition shadow-lg shadow-violet-900/30 disabled:opacity-40"
          >
            Send Invite
          </button>
        </form>
      </div>

      <!-- 4. Pending Invites -->
      <div class="bg-[#1a1825] rounded-2xl border border-white/5 overflow-hidden">
        <div class="px-5 py-4 flex items-center gap-2 border-b border-white/5">
          <h2 class="text-white font-semibold">Pending Invites</h2>
          <span v-if="pendingInvites.length > 0" class="bg-violet-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{{ pendingInvites.length }}</span>
        </div>
        <div v-if="pendingInvites.length === 0" class="px-5 py-10 text-center">
          <p class="text-gray-500 text-sm">No pending invites.</p>
        </div>
        <div
          v-for="invite in pendingInvites"
          :key="invite.id"
          class="px-5 py-4 flex items-center justify-between border-b border-white/5 last:border-0"
        >
          <div>
            <p class="text-white font-medium text-sm">Group #{{ invite.group_id }}</p>
            <p class="text-gray-500 text-xs mt-0.5">Pending invitation</p>
          </div>
          <div class="flex gap-2">
            <button @click="handleAccept(invite.id)" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition">Accept</button>
            <button @click="handleDecline(invite.id)" class="bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition">Decline</button>
          </div>
        </div>
      </div>

      <div class="h-4"></div>
    </div>
  </div>
</template>
