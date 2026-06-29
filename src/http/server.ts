import formBody from '@fastify/formbody';
import Fastify from 'fastify';
import type { FastifyReply } from 'fastify';
import type { Bot } from 'grammy';

import { env } from '../config/env';
import { paidAccessKeyboard } from '../bot/keyboards';
import type { PaymentServiceLike } from '../bot/types';
import { createResultSuccessResponse, type RobokassaResultPayload } from '../payments/robokassa';
import { formatDateTime } from '../utils/time';

export async function createHttpServer(params: { bot: Bot; paymentService: PaymentServiceLike }) {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
  });

  await app.register(formBody);

  app.get('/health', async () => ({ ok: true }));

  app.get('/robokassa/result', async (request, reply) => {
    return handleRobokassaResult(request.query, reply, params);
  });

  app.post('/robokassa/result', async (request, reply) => {
    return handleRobokassaResult(
      {
        ...(request.query as Record<string, unknown>),
        ...(request.body as Record<string, unknown>),
      },
      reply,
      params,
    );
  });

  app.get('/robokassa/success', async (_, reply) => {
    return reply
      .type('text/plain; charset=utf-8')
      .send('Оплата прошла успешно. Вернитесь в Telegram, доступ придет автоматически.');
  });

  app.get('/robokassa/fail', async (_, reply) => {
    return reply
      .type('text/plain; charset=utf-8')
      .send('Оплата не была завершена. Вы можете вернуться в бота и попробовать еще раз.');
  });

  return app;
}

async function handleRobokassaResult(
  rawPayload: unknown,
  reply: FastifyReply,
  params: {
    bot: Bot;
    paymentService: PaymentServiceLike;
  },
) {
  const payload = parseRobokassaPayload(rawPayload);

  if (!payload) {
    return reply.status(400).send('Invalid Robokassa payload');
  }

  const result = await params.paymentService.handlePaidCallback(payload);

  if (result.kind !== 'accepted') {
    console.warn('Robokassa callback rejected', result);
    return reply.status(400).send(result.kind);
  }

  if (!result.alreadyPaid) {
    await params.bot.api.sendMessage(
      result.grant.telegramUserId,
      `🎉 Готово! Добро пожаловать.` + '\n' + 'Вебинар уже ждёт вас. Нажимайте кнопку ниже и устраивайтесь поудобнее.',
      // `🎉 Готово! Добро пожаловать. Доступ открыт до ${formatDateTime(result.grant.endsAt)}.`,
      {
        reply_markup: paidAccessKeyboard(result.grant.inviteLink),
      },
    );
  }

  return reply
    .type('text/plain; charset=utf-8')
    .send(createResultSuccessResponse(result.invoiceId));
}

function parseRobokassaPayload(rawPayload: unknown): RobokassaResultPayload | null {
  const outSum = getPayloadValue(rawPayload, 'OutSum');
  const invoiceId = getPayloadValue(rawPayload, 'InvId');
  const signature = getPayloadValue(rawPayload, 'SignatureValue');

  if (!outSum || !invoiceId || !signature) {
    return null;
  }

  return {
    OutSum: outSum,
    InvId: invoiceId,
    SignatureValue: signature,
  };
}

function getPayloadValue(rawPayload: unknown, key: string): string | undefined {
  if (!rawPayload || typeof rawPayload !== 'object') {
    return undefined;
  }

  const value = (rawPayload as Record<string, unknown>)[key];

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return undefined;
}
