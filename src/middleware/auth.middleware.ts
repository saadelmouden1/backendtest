import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // const token = req.headers.authorization?.split(' ')[1]

  const tokenFromCookie = req.cookies?.accessToken
  const tokenFromHeader = req.headers.authorization?.split(' ')[1]

  const token = tokenFromCookie || tokenFromHeader

  if (!token) {
    res.status(401).json({ success: false, message: 'No token provided' })
    return
  }

  try {
    const decoded = verifyToken(token) as { id: string; email: string; type: string }
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}