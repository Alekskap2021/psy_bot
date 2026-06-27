// import { Bot } from 'grammy'
//
// import { AccessService } from './access/access.service'
// import { startExpiryWorker } from './access/expiry.worker'
// import { createBot } from './bot/bot'
// import { UserService } from './bot/user.service'
// import { env } from './config/env'
// import { db } from './db/client'
// import { createHttpServer } from './http/server'
// import { PaymentService } from './payments/payment.service'

import { Bot } from 'grammy'
import { createBot } from './bot/bot'
import { env } from './config/env'
import { createHttpServer } from './http/server'
import {mockPaymentService} from "./__mocks__/mockPaymentService"
import {mockUserService} from "./__mocks__/mockUserService"
import {mockAccessService} from "./__mocks__/mockAccessGrantService"

async function main(): Promise<void> {
  const telegramBot = new Bot(env.BOT_TOKEN)
  // const accessService = new AccessService(db, telegramBot.api)
  // const paymentService = new PaymentService(db, accessService)
  // const userService = new UserService(db)








  const bot = createBot(
    {
      accessService: mockAccessService,
      paymentService: mockPaymentService,
      userService: mockUserService,
    },
    telegramBot,
  )

  const httpServer = await createHttpServer({
    bot,
    paymentService: mockPaymentService,
  })

  // const expiryWorker = startExpiryWorker(mockAccessService)

  const shutdown = async () => {
    // clearInterval(expiryWorker)
    bot.stop()
    await httpServer.close()
  }

  process.once('SIGINT', () => {
    void shutdown().finally(() => process.exit(0))
  })
  process.once('SIGTERM', () => {
    void shutdown().finally(() => process.exit(0))
  })

  await httpServer.listen({
    host: '0.0.0.0',
    port: env.PORT,
  })

  console.info(`HTTP server is listening on port ${env.PORT}`)
  await bot.start()
}

void main().catch((error) => {
  console.error('Application failed to start', error)
  process.exit(1)
})
