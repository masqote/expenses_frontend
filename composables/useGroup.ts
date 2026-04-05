export interface GroupMemberSummary {
  user_id: number
  name: string
  salary: number | null
  total_income: number
  total_expenses: number
  total_adjustments: number
  balance: number | null
}

export interface GroupSummary {
  period: string
  members: GroupMemberSummary[]
  group_balance: number | null
}

export interface GroupExpense {
  id: number
  user_id: number
  user_name: string
  label: string
  amount: string
  period: string
  created_at: string
}

export interface Invite {
  id: number
  group_id: number
  invitee_id: number
  status: string
}

export const useGroup = () => {
  const { apiFetch } = useApi()
  const groupSummary = useState<GroupSummary | null>('groupSummary', () => null)
  const groupExpenses = useState<GroupExpense[]>('groupExpenses', () => [])
  const pendingInvites = useState<Invite[]>('pendingInvites', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchGroupSummary = async (groupId: number, from: string, to: string) => {
    loading.value = true
    try {
      groupSummary.value = await apiFetch<GroupSummary>(`/groups/${groupId}/summary?from=${from}&to=${to}`)
    } catch (e: any) {
      error.value = e?.data?.message ?? 'Failed to fetch group summary'
    } finally {
      loading.value = false
    }
  }

  const fetchGroupExpenses = async (groupId: number, from: string, to: string) => {
    loading.value = true
    try {
      groupExpenses.value = await apiFetch<GroupExpense[]>(`/groups/${groupId}/expenses?from=${from}&to=${to}`)
    } catch (e: any) {
      error.value = e?.data?.message ?? 'Failed to fetch group expenses'
    } finally {
      loading.value = false
    }
  }

  const fetchPendingInvites = async () => {
    try {
      pendingInvites.value = await apiFetch<Invite[]>('/invites')
    } catch {}
  }

  const acceptInvite = async (id: number) => {
    await apiFetch(`/invites/${id}/accept`, { method: 'POST' })
    pendingInvites.value = pendingInvites.value.filter(i => i.id !== id)
  }

  const declineInvite = async (id: number) => {
    await apiFetch(`/invites/${id}/decline`, { method: 'POST' })
    pendingInvites.value = pendingInvites.value.filter(i => i.id !== id)
  }

  const createGroup = async (name: string) => {
    return apiFetch<{ id: number; name: string }>('/groups', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }

  const sendInvite = async (groupId: number, email: string) => {
    return apiFetch(`/groups/${groupId}/invites`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  const removeMember = async (groupId: number, userId: number) => {
    await apiFetch(`/groups/${groupId}/members/${userId}`, { method: 'DELETE' })
  }

  return {
    groupSummary,
    groupExpenses,
    pendingInvites,
    loading,
    error,
    fetchGroupSummary,
    fetchGroupExpenses,
    fetchPendingInvites,
    acceptInvite,
    declineInvite,
    createGroup,
    sendInvite,
    removeMember,
  }
}
