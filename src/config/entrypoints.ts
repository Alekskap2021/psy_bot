export const entrypoints = {
  app: {
    publicBaseUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  telegram: {
    // Prod cannel
    privateChannelId: '-1004476190013',

    // Test channel
    // privateChannelId: '-1003935621484',
    // contactUsername: 'Harva_aa',
  },
  product: {
    amountRub: '10.00',
    // amountRub: '1490.00',
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
    purchase: `⭐️  Получить доступ`,
    faq: '❔  Часто задаваемые вопросы',
    contact: '👩🏼‍💻 Связаться со мной',
    backToMenu: '⬅️  Назад в меню',
  },
  messages: {
    welcome:
      'Привет! Меня зовут Александра, я психолог.\n' +
        '\n' +
        'Добро пожаловать! Здесь вы можете приобрести вебинар "Моя сексуальность", узнать ответы на самые частые вопросы о нем и, если захотите, записаться ко мне на индивидуальную терапию. \n' +
        '\n' +
        'Выберите нужный раздел в меню - бот поможет с остальным 🤍',
    contact:
      'Если у вас возникли вопросы о вебинаре, вы хотите записаться на терапию или столкнулись с техническими сложностями - смело пишите мне в Telegram.\n' + '\n' +  'Я всегда стараюсь отвечать как можно быстрее. И да, я не кусаюсь 🙂',
    paymentProcessing:
      'Платеж обрабатывается. Если оплата уже прошла, доступ придет автоматически.',
  },
} as const
