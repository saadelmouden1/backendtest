import prisma from '../config/database'
import { hashPassword, comparePassword } from '../utils/hash'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import crypto from 'crypto'


const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export const register = async (data: {
  firstName: string
  lastName: string
  email: string
  password: string
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existing) {
    throw { status: 409, message: 'Email already exists' }
  }

  const hashed = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashed,
    }
  })

  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    type: user.type
  })

  const refreshToken = signRefreshToken({ id: user.id })


  await prisma.refreshToken.create({
    data: {
      token: hashToken(refreshToken),  // ← hashed
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })

  return { user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, type: user.type }, accessToken, refreshToken }
}


export const login = async (data: {
  email: string
  password: string
}) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (!user || !user.password) {
    throw { status: 401, message: 'Invalid email or password' }
  }

  const isMatch = await comparePassword(data.password, user.password)

  if (!isMatch) {
    throw { status: 401, message: 'Invalid email or password' }
  }

  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    type: user.type
  })

  const refreshToken = signRefreshToken({ id: user.id })

  
  await prisma.refreshToken.create({
    data: {
      token: hashToken(refreshToken),  // ← hashed
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })

  return { user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, type: user.type }, accessToken, refreshToken }
}


export const getMe = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id }
  })

  if (!user) {
    throw { status: 404, message: 'User not found' }
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    type: user.type,
  }
}


export const refresh = async (token: string) => {
  if (!token) {
    throw { status: 401, message: 'No refresh token provided' }
  }

  const hashedToken = hashToken(token)

  const stored = await prisma.refreshToken.findUnique({
    where: { token: hashedToken },
    include: { user: true }
  })

  if (!stored) {
    throw { status: 401, message: 'Invalid refresh token' }
  }

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token: hashedToken } })
    throw { status: 401, message: 'Refresh token expired' }
  }

  try {
    verifyRefreshToken(token)
  } catch {
    await prisma.refreshToken.delete({ where: { token: hashedToken } })
    throw { status: 401, message: 'Invalid refresh token' }
  }

  // delete old token
  await prisma.refreshToken.delete({ where: { token: hashedToken } })

  // generate new refresh token
  const newRefreshToken = signRefreshToken({ id: stored.user.id })

  await prisma.refreshToken.create({
    data: {
      token: hashToken(newRefreshToken),
      userId: stored.user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })

  const accessToken = signAccessToken({
    id: stored.user.id,
    email: stored.user.email,
    type: stored.user.type
  })

  return { accessToken, refreshToken: newRefreshToken }
}

export const logout = async (token: string) => {
  if (!token) {
    // no token means already logged out — fine
    return { message: 'Logged out successfully' }
  }

  await prisma.refreshToken.deleteMany({
    where: { token: hashToken(token) }
  })

  return { message: 'Logged out successfully' }
}


export const googleAuth = async (user: {
  id: string
  email: string
  type: string
  firstName: string
  lastName: string
}) => {
  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    type: user.type
  })

  const refreshToken = signRefreshToken({ id: user.id })

 
  await prisma.refreshToken.create({
    data: {
      token: hashToken(refreshToken),  
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })

  return { accessToken, refreshToken, user }
}