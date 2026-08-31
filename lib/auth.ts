import { getAuthUser } from './custom-auth'

export type AppUser = {
  id: string
  name: string
  email: string
  role?: string
  avatarUrl?: string | null
}

export async function getCurrentUser(): Promise<AppUser | null> {
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

  return null
}

export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}
