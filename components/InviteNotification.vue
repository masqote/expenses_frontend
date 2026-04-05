<script setup lang="ts">
const { pendingInvites, fetchPendingInvites, acceptInvite, declineInvite } = useGroup()

onMounted(fetchPendingInvites)
</script>

<template>
  <div v-if="pendingInvites.length > 0" class="bg-yellow-50 border border-yellow-300 rounded p-4 space-y-2">
    <p class="font-semibold text-yellow-800">You have {{ pendingInvites.length }} pending invite(s)</p>
    <div v-for="invite in pendingInvites" :key="invite.id" class="flex items-center gap-3">
      <span class="text-sm">Group invite #{{ invite.group_id }}</span>
      <button @click="acceptInvite(invite.id)" class="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Accept</button>
      <button @click="declineInvite(invite.id)" class="text-sm bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500">Decline</button>
    </div>
  </div>
</template>
