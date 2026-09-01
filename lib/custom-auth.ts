import crypto from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from './db'

export const AUTH_COOKIE_NAME = 'campfire_session'
const SESSION_EXPIRY_DAYS = 30

/**
 * Hashes a plaintext password with a unique salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verifies a password against the stored salt:hash string.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':')
  if (!salt || !key) return false
  const keyBuffer = Buffer.from(key, 'hex')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return crypto.timingSafeEqual(keyBuffer, derivedKey)
}

/**
 * Generates a secure random session token.
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Creates a database session and returns the session token.
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS)

  try {
    if (process.env.DATABASE_URL) {
      await prisma.session.create({
        data: {
          userId,
          token,
          expiresAt,
        },
      })
    }
  } catch (err) {
    console.warn('[Session] DB createSession error:', err)
  }

  return token
}

/**
 * Validates a session token and returns the corresponding User record.
 */
export async function validateSession(token: string) {
  if (!token) return null

  try {
    if (process.env.DATABASE_URL) {
      const session = await prisma.session.findUnique({
        where: { token },
        include: {
          user: {
            include: {
              links: {
                include: {
                  creator: true,
                },
              },
            },
          },
        },
      })

      if (!session || session.expiresAt < new Date()) {
        if (session) {
          await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
        }
        return null
      }

      return session.user
    }
  } catch (err) {
    console.warn('[Session] DB validateSession error:', err)
  }

  return null
}

/**
 * Gets the current authenticated user from request cookies.
 */
export async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null

  const user = await validateSession(token)
  if (user) {
    const fallbackName = user.displayName || (user.email ? user.email.split('@')[0] : user.phone ? `Fan (${user.phone.slice(-4)})` : 'Fan')
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: fallbackName,
      displayName: fallbackName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      links: user.links,
    }
  }

  return null
}
