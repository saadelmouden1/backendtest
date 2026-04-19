import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import * as authService from '../services/auth.service'

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body)

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: result
  })
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body)

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: result
  })
})

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getMe(req.user!.id)

  res.status(200).json({
    success: true,
    message: 'User fetched successfully',
    data: result
  })
})

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body

  const result = await authService.refresh(refreshToken)

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: result
  })
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body

  const result = await authService.logout(refreshToken)

  res.status(200).json({
    success: true,
    message: result.message,
    data: null
  })
})