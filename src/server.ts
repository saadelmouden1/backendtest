import http from 'http'
import app from './app'
import { env } from './config/env'
import { initSocket } from './config/socket'
import prisma from './config/database'

const httpServer = http.createServer(app)

initSocket(httpServer)

const start = async () => {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')

    httpServer.listen(env.PORT, () => {
      console.log(`✅ Server running on port ${env.PORT}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

start()