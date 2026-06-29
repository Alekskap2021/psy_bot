import { createHash, timingSafeEqual } from 'node:crypto';

import { entrypoints } from '../config/entrypoints';
import { env } from '../config/env';

const ROBOKASSA_PAYMENT_URL = 'https://auth.robokassa.ru/Merchant/Index.aspx';

export type RobokassaResultPayload = {
  OutSum: string;
  InvId: string;
  SignatureValue: string;
};

export function normalizeAmount(amount: string | number): string {
  return Number(amount).toFixed(2);
}

export function createPaymentUrl(params: {
  invoiceId: number;
  amount: string;
  description: string;
}): string {
  const amount = normalizeAmount(params.amount);
  const signature = createSignature([
    env.ROBOKASSA_MERCHANT_LOGIN,
    amount,
    String(params.invoiceId),
    env.ROBOKASSA_PASSWORD_1,
  ]);

  const url = new URL(ROBOKASSA_PAYMENT_URL);
  url.searchParams.set('MerchantLogin', env.ROBOKASSA_MERCHANT_LOGIN);
  url.searchParams.set('OutSum', amount);
  url.searchParams.set('InvId', String(params.invoiceId));
  url.searchParams.set('Description', params.description);
  url.searchParams.set('SignatureValue', signature);
  url.searchParams.set('Culture', 'ru');
  url.searchParams.set('Encoding', 'utf-8');

  if (env.ROBOKASSA_TEST_MODE) {
    url.searchParams.set('IsTest', '1');
  }

  return url.toString();
}

export function createResultSuccessResponse(invoiceId: number): string {
  return `OK${invoiceId}`;
}

export function verifyResultSignature(payload: RobokassaResultPayload): boolean {
  const expected = createSignature([
    payload.OutSum,
    payload.InvId,
    env.ROBOKASSA_PASSWORD_2,
  ]);

  return safeEqual(expected, payload.SignatureValue);
}

export function robokassaResultUrl(): string {
  return new URL('/robokassa/result', entrypoints.app.publicBaseUrl).toString();
}

export function robokassaSuccessUrl(): string {
  return new URL('/robokassa/success', entrypoints.app.publicBaseUrl).toString();
}

export function robokassaFailUrl(): string {
  return new URL('/robokassa/fail', entrypoints.app.publicBaseUrl).toString();
}

function createSignature(parts: string[]): string {
  return createHash('md5').update(parts.join(':')).digest('hex').toUpperCase();
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left.toUpperCase());
  const rightBuffer = Buffer.from(right.toUpperCase());

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
