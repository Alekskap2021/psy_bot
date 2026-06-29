import {Context, InputFile} from 'grammy'

import { entrypoints } from '../../config/entrypoints'
import { formatDateTime } from '../../utils/time'
import {
  mainMenuKeyboard,
  paidAccessKeyboard,
} from '../keyboards'
import type { BotServices } from '../types'

export async function showStart(ctx: Context, services: BotServices): Promise<void> {
  if (!ctx.from) {
    await ctx.reply('Не удалось определить пользователя Telegram.')
    return
  }

  await services.userService.upsertFromTelegram(ctx.from)

  const activeGrant = await services.accessService.getOrRefreshInviteLink(
    ctx.from.id,
  )

  if (activeGrant) {
    await ctx.reply(
      `У вас уже есть активный доступ до ${formatDateTime(activeGrant.endsAt)}.`,
      {
        reply_markup: paidAccessKeyboard(activeGrant.inviteLink),
      },
    )
    return
  }


  await ctx.replyWithPhoto(new InputFile('assets/welcome.jpg'), {
    caption: entrypoints.messages.welcome,
    reply_markup: mainMenuKeyboard(),
  })
}

export async function showMainMenu(ctx: Context): Promise<void> {
  const text = entrypoints.messages.welcome
  const message = ctx.callbackQuery?.message

  if (message && 'text' in message) {
    await ctx.editMessageText(text, {
      reply_markup: mainMenuKeyboard(),
    })
    return
  }

  if (message && 'caption' in message) {
    await ctx.editMessageCaption({
      caption: text,
      reply_markup: mainMenuKeyboard(),
    })
    return
  }

  await ctx.reply(text, {
    reply_markup: mainMenuKeyboard(),
  })
}
