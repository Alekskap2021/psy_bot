import type { Context } from 'grammy'

import { formatDateTime } from '../../utils/time'
import {
  paidAccessKeyboard,
  paymentKeyboard,
} from '../keyboards'
import type { BotServices } from '../types'

export async function handlePurchase(
  ctx: Context,
  services: BotServices,
): Promise<void> {
  if (!ctx.from) {
    await ctx.reply('Не удалось определить пользователя Telegram.')
    return
  }

  await services.userService.upsertFromTelegram(ctx.from)

  const result = await services.paymentService.requestPaymentLink(ctx.from.id)

  if (result.kind === 'active_access') {
    await ctx.reply(
      `У вас уже есть активный доступ до ${formatDateTime(result.grant.endsAt)}.`,
      {
        reply_markup: paidAccessKeyboard(result.grant.inviteLink),
      },
    )
    return
  }

  if (result.kind === 'rate_limited') {
    await ctx.reply(
      `Новая ссылка на оплату будет доступна примерно через ${result.retryAfterMinutes} мин.`,
    )
    return
  }

  const prefix =
    result.kind === 'existing_payment'
      ? 'У вас уже есть активная ссылка на оплату.'
      : 'Ссылка на оплату готова.'

  await ctx.reply(
    `${prefix}\nСсылка действует до ${formatDateTime(result.payment.expiresAt)}.`,
    {
      reply_markup: paymentKeyboard(result.paymentUrl),
    },
  )
}
