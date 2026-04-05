<script setup lang="ts">
import type { GroupMemberSummary, GroupExpense } from '~/composables/useGroup'

defineProps<{
  member: GroupMemberSummary
  expenses: GroupExpense[]
}>()

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : `Rp ${Math.abs(n).toLocaleString('id-ID')}`

// Avatar color based on first letter
const avatarColors = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
]
const avatarColor = (name: string) =>
  avatarColors[name.charCodeAt(0) % avatarColors.length]

const expanded = ref(true)
</script>

<template>
  <div class="bg-[#1a1825] rounded-2xl border border-white/5 overflow-hidden">
    <!-- Member header -->
    <button
      @click="expanded = !expanded"
      class="w-full px-5 py-4 flex items-center gap-3 hover:bg-white/3 transition text-left"
    >
      <!-- Avatar -->
      <div :class="`bg-gradient-to-br ${avatarColor(member.name)}`" class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
        {{ member.name.charAt(0).toUpperCase() }}
      </div>

      <!-- Name + balance -->
      <div class="flex-1 min-w-0">
        <p class="text-white font-semibold text-sm">{{ member.name }}</p>
        <p class="text-xs mt-0.5" :class="member.balance == null ? 'text-gray-500' : member.balance < 0 ? 'text-red-400' : 'text-emerald-400'">
          {{ member.balance == null ? 'Salary not set' : (member.balance < 0 ? '-' : '+') + fmt(member.balance) }}
        </p>
      </div>

      <!-- Chevron -->
      <svg :class="expanded ? 'rotate-180' : ''" class="w-4 h-4 text-gray-500 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <!-- Expanded content -->
    <div v-if="expanded" class="border-t border-white/5">
      <!-- Stats row -->
      <div class="grid grid-cols-3 gap-px bg-white/5">
        <div class="bg-[#1a1825] px-4 py-3 text-center">
          <p class="text-gray-500 text-xs mb-1">Salary</p>
          <p class="text-white text-sm font-semibold">{{ fmt(member.salary) }}</p>
        </div>
        <div class="bg-[#1a1825] px-4 py-3 text-center">
          <p class="text-gray-500 text-xs mb-1">Income</p>
          <p class="text-emerald-400 text-sm font-semibold">{{ fmt(member.total_income) }}</p>
        </div>
        <div class="bg-[#1a1825] px-4 py-3 text-center">
          <p class="text-gray-500 text-xs mb-1">Expenses</p>
          <p class="text-rose-400 text-sm font-semibold">{{ fmt(member.total_expenses) }}</p>
        </div>
      </div>

      <!-- Expense list -->
      <div v-if="expenses.length > 0">
        <div class="px-5 py-2.5 border-t border-white/5">
          <p class="text-gray-500 text-xs font-medium uppercase tracking-wide">Transactions</p>
        </div>
        <div
          v-for="e in expenses"
          :key="e.id"
          class="px-5 py-3 flex items-center gap-3 border-t border-white/5"
        >
          <div class="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-sm shrink-0">
            {{ e.category?.icon ?? '💸' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-sm truncate">{{ e.label }}</p>
            <p class="text-gray-500 text-xs">{{ e.category?.name ?? 'Uncategorized' }}</p>
          </div>
          <span class="text-rose-400 text-sm font-semibold shrink-0">
            -Rp {{ parseFloat(e.amount).toLocaleString('id-ID') }}
          </span>
        </div>
      </div>
      <div v-else class="px-5 py-6 text-center border-t border-white/5">
        <p class="text-gray-600 text-xs">No expenses this period</p>
      </div>
    </div>
  </div>
</template>
