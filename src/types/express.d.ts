import type { UserType } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        type: UserType | string
        firstName?: string
        lastName?: string
      }
    }
  }
}