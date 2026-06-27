# Psychology Bot

Telegram-бот на TypeScript для продажи временного доступа к закрытому каналу через Робокассу.

## Настройка

1. Скопируйте `.env.example` в `.env` и заполните секреты.
2. В `src/config/entrypoints.ts` укажите:
   - публичный HTTPS URL backend;
   - id закрытого Telegram-канала;
   - username для связи;
   - цену, срок доступа, TTL invite-link и rate limit.
3. Создайте Neon database и укажите `DATABASE_URL`.
4. Сгенерируйте и примените миграции:

```bash
npm run db:generate
npm run db:migrate
```

## Локальная разработка

```bash
npm run dev
```

Для приема callback от Робокассы нужен публичный HTTPS URL. Локально можно использовать tunnel, а в Робокассе указать:

- `ResultURL`: `/robokassa/result`
- `SuccessURL`: `/robokassa/success`
- `FailURL`: `/robokassa/fail`

## Проверка

```bash
npm run build
npm test
```

## Telegram-права

Бот должен быть администратором закрытого канала с правами создавать invite links и банить пользователей. Исключение после окончания доступа работает через `banChatMember` с последующим `unbanChatMember`, чтобы пользователь мог купить доступ снова.
