import type { Context } from 'grammy'

import { entrypoints } from '../../config/entrypoints'

export async function showContact(ctx: Context): Promise<void> {
  const contactUrl = `https://t.me/${entrypoints.telegram.contactUsername}`

  await ctx.reply(`${entrypoints.messages.contact}\n${contactUrl}`)
}
