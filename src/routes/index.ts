import { Router } from 'express'
import authRoutes from './auth.routes'

const router = Router()

router.use('/auth', authRoutes)

// will add more routes here later
// router.use('/users', userRoutes)
// router.use('/broadcasts', broadcastRoutes)
// router.use('/projects', projectRoutes)

export default router