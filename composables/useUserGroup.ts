export const useUserGroup = () => {
  const { apiFetch } = useApi()

  const userGroup = useState<{ id: number; name: string; owner_id?: number } | null>('userGroup', () => null)

  const setUserGroup = (group: { id: number; name: string } | null) => {
    userGroup.value = group
  }

  // Always fetch from API — source of truth
  const refreshUserGroup = async () => {
    userGroup.value = null // clear stale data immediately
    try {
      const group = await apiFetch<{ id: number; name: string } | null>('/groups/my')
      userGroup.value = (group && group.id) ? group : null
    } catch {
      userGroup.value = null
    }
  }

  return { userGroup, setUserGroup, refreshUserGroup }
}
