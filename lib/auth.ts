import { getAuthUser } from './custom-auth'
import { fan } from './mock-data'

export type AppUser = {
  id: string
  name: string
  email: string
  role?: string
  avatarUrl?: string | null
}

export async function getCurrentUser(): Promise<AppUser> {
  const user = await getAuthUser()
  if (user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    }
  }

  // Seamless fallback for local preview
  return {
    id: 'fan-amina-01',
    name: fan.name,
    email: 'amina@example.com',
    role: 'user',
    avatarUrl: null,
  }
}

export async function requireUser() {
  return getCurrentUser()
}
