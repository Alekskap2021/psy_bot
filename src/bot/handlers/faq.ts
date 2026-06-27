import type { Context } from 'grammy'

import { findFaqItem } from '../../texts/faq'
import { faqKeyboard } from '../keyboards'

export async function showFaq(ctx: Context): Promise<void> {
  const text = 'Я постаралась разобрать все популярные и даже не самые частые вопросы связанные с курсом. Ищите ответ по нужному подзаголовку ниже'
  const message = ctx.callbackQuery?.message

  if (message && 'text' in message) {
    await ctx.editMessageText(text, {
      reply_markup: faqKeyboard(),
    })
    return
  }

  if (message && 'caption' in message) {
    await ctx.editMessageCaption({
      caption: text,
      reply_markup: faqKeyboard(),
    })
    return
  }

  await ctx.reply(text, {
    reply_markup: faqKeyboard(),
  })
}

export async function answerFaq(ctx: Context, faqId: string): Promise<void> {
  const item = findFaqItem(faqId)

  if (!item) {
    await ctx.answerCallbackQuery({
      text: 'Вопрос не найден',
      show_alert: true,
    })
    return
  }

  await ctx.answerCallbackQuery()
  await ctx.reply(`*${item.question}*\n\n${item.answer}`, {
    parse_mode: 'Markdown',
  })
}
