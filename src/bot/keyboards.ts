import { InlineKeyboard } from 'grammy'

import { entrypoints } from '../config/entrypoints'
import { faqItems } from '../texts/faq'

export const callbackData = {
  purchase: 'purchase',
  faq: 'faq',
  contact: 'contact',
  menu: 'menu',
} as const

export function mainMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text(entrypoints.buttons.purchase + ` (${entrypoints.product.amountRub} ₽)`, callbackData.purchase)
    .row()
    .text(entrypoints.buttons.faq, callbackData.faq)
    .row()
    .text(entrypoints.buttons.contact, callbackData.contact)
}

export function faqKeyboard(): InlineKeyboard {
  const keyboard = new InlineKeyboard()

  for (const item of faqItems) {
    keyboard.text(item.question, `faq:${item.id}`).row()
  }

  return keyboard.text(entrypoints.buttons.backToMenu, callbackData.menu)
}

export function paidAccessKeyboard(inviteLink: string): InlineKeyboard {
  return new InlineKeyboard()
    .url('🤫 Поговорим о том самом', inviteLink)
    .row()
    .text(entrypoints.buttons.backToMenu, callbackData.menu)
}

export function paymentKeyboard(paymentUrl: string): InlineKeyboard {
  return new InlineKeyboard()
    .url(`🚀  Перейти к оплате (${entrypoints.product.amountRub} ₽)`, paymentUrl)
    .row()
    .text(entrypoints.buttons.backToMenu, callbackData.menu)
}
