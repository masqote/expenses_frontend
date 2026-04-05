export interface Category {
  id: number
  name: string
  icon: string | null
  is_default: boolean
}

export const useCategories = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const { token } = useAuth()

  const categories = useState<Category[]>('categories', () => [])

  const fetchCategories = async () => {
    categories.value = await $fetch<Category[]>(`${apiBase}/categories`, {
      headers: { Authorization: `Bearer ${token.value}` },
    })
  }

  const createCategory = async (name: string, icon?: string) => {
    const cat = await $fetch<Category>(`${apiBase}/categories`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { name, icon },
    })
    categories.value.push(cat)
    return cat
  }

  return { categories, fetchCategories, createCategory }
}
