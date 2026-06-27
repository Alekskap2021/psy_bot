import { Bot } from 'grammy'

import { env } from '../config/env'
import { answerFaq, showFaq } from './handlers/faq'
import { showContact } from './handlers/contact'
import { handlePurchase } from './handlers/purchase'
import { showMainMenu, showStart } from './handlers/start'
import { callbackData } from './keyboards'
import type { BotServices } from './types'

export function createBot(
  services: BotServices,
  bot = new Bot(env.BOT_TOKEN),
): Bot {
  bot.command('start', async (ctx) => {
    await showStart(ctx, services)
  })

  bot.callbackQuery(callbackData.menu, async (ctx) => {
    await ctx.answerCallbackQuery()
    await showMainMenu(ctx)
  })

  bot.callbackQuery(callbackData.purchase, async (ctx) => {
    await ctx.answerCallbackQuery()
    await handlePurchase(ctx, services)
  })

  bot.callbackQuery(callbackData.faq, async (ctx) => {
    await ctx.answerCallbackQuery()
    await showFaq(ctx)
  })

  bot.callbackQuery(/^faq:(.+)$/, async (ctx) => {
    await answerFaq(ctx, ctx.match[1])
  })

  bot.callbackQuery(callbackData.contact, async (ctx) => {
    await ctx.answerCallbackQuery()
    await showContact(ctx)
  })

  bot.catch((error) => {
    console.error('Telegram bot error', error)
  })

  return bot
}
