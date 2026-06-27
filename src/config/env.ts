import 'dotenv/config'

import { z } from 'zod'

const booleanFromString = z
  .string()
  .optional()
  .default('false')
  .transform((value) => value === 'true' || value === '1')

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .optional()
    .default('development'),
  PORT: z.coerce.number().int().positive().optional().default(3000),
  BOT_TOKEN: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  ROBOKASSA_MERCHANT_LOGIN: z.string().min(1),
  ROBOKASSA_PASSWORD_1: z.string().min(1),
  ROBOKASSA_PASSWORD_2: z.string().min(1),
  ROBOKASSA_TEST_MODE: booleanFromString,
})

export const env = envSchema.parse(process.env)

export type Env = typeof env
