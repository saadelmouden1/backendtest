import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import routes from './routes/index'
import { errorMiddleware } from './middleware/error.middleware'
import passport from './config/passport'

const app = express()

// security
app.use(helmet())
app.use(cors())

// parse request body as json
app.use(express.json())

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