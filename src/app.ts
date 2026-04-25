import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import routes from './routes/index'
import { errorMiddleware } from './middleware/error.middleware'
import cookieParser from 'cookie-parser'
import passport from './config/passport'
import { env } from './config/env'

const app = express()

// security
app.use(helmet())

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}))

// parse request body as json
app.use(express.json())
app.use(cookieParser())   
app.use(passport.initialize())

// health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' })
})

// all routes
app.use('/api', routes)

// error handler — must be last
app.use(errorMiddleware)

export default app