import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  REFRESH_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  FRONTEND_URL: z.string().min(1),
})

export const env = schema.parse(process.env)