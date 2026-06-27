export const entrypoints = {
  app: {
    publicBaseUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  telegram: {
    privateChannelId: '-1000000000000',
    contactUsername: 'Harva_aa',
  },
  product: {
    amountRub: '1990.00',
    currency: 'RUB',
    description: 'Доступ к закрытому каналу с видеоматериалами',
    accessDurationDays: 30,
    inviteLinkTtlMinutes: 30,
  },
  limits: {
    paymentLinkRateLimitMinutes: 5,
    pendingPaymentTtlMinutes: 30,
  },
  worker: {
    expiryCheckIntervalMs: 60_000,
  },
  buttons: {
    purchase: '⭐️  Получить доступ',
    faq: '❔  Часто задаваемые вопросы',
    contact: '👩🏼‍💻 Связаться со мной',
    backToMenu: '⬅️  Назад в меню',
  },
  messages: {
    welcome:
      'Здравствуйте! Здесь можно приобрести доступ к закрытому каналу с видеоматериалами.',
    contact:
      'Если возникнут любые вопросы или технические сложности, вы всегда можете написать мне в Telegram. Я не кусаюсь 🙂.',
    paymentProcessing:
      'Платеж обрабатывается. Если оплата уже прошла, доступ придет автоматически.',
  },
} as const
