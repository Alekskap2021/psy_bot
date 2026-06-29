import { and, desc, eq, gt } from 'drizzle-orm';

import type { AccessService } from '../access/access.service';
import { entrypoints } from '../config/entrypoints';
import type { Database } from '../db/client';
import { payments, users, type AccessGrant, type Payment } from '../db/schema';
import { addMinutes, minutesUntil } from '../utils/time';
import {
  createPaymentUrl,
  normalizeAmount,
  type RobokassaResultPayload,
  verifyResultSignature,
} from './robokassa';
import { getPaymentRateLimitUntil } from './payment-policy';

export type PaymentLinkResult =
  | {
      kind: 'active_access';
      grant: AccessGrant;
    }
  | {
      kind: 'existing_payment' | 'new_payment';
      payment: Payment;
      paymentUrl: string;
    }
  | {
      kind: 'rate_limited';
      retryAfterMinutes: number;
    };

export type PaidCallbackResult =
  | {
      kind: 'accepted';
      invoiceId: number;
      grant: AccessGrant;
      alreadyPaid: boolean;
    }
  | {
      kind: 'invalid_signature' | 'payment_not_found' | 'amount_mismatch';
      invoiceId?: number;
    };

export class PaymentService {
  constructor(
    private readonly database: Database,
    private readonly accessService: AccessService,
  ) {}

  async requestPaymentLink(telegramUserId: number): Promise<PaymentLinkResult> {
    const activeGrant = await this.accessService.getOrRefreshInviteLink(telegramUserId);

    if (activeGrant) {
      return {
        kind: 'active_access',
        grant: activeGrant,
      };
    }

    const now = new Date();
    const existingPendingPayment = await this.findFreshPendingPayment(telegramUserId, now);

    if (existingPendingPayment?.paymentUrl) {
      return {
        kind: 'existing_payment',
        payment: existingPendingPayment,
        paymentUrl: existingPendingPayment.paymentUrl,
      };
    }

    const [user] = await this.database
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramUserId))
      .limit(1);

    const rateLimitUntil = getPaymentRateLimitUntil(user?.lastPaymentLinkCreatedAt);

    if (rateLimitUntil && rateLimitUntil > now) {
      return {
        kind: 'rate_limited',
        retryAfterMinutes: minutesUntil(rateLimitUntil, now),
      };
    }

    return this.createNewPayment(telegramUserId, now);
  }

  async handlePaidCallback(payload: RobokassaResultPayload): Promise<PaidCallbackResult> {
    const invoiceId = Number(payload.InvId);

    if (!Number.isInteger(invoiceId)) {
      return { kind: 'payment_not_found' };
    }

    if (!verifyResultSignature(payload)) {
      return { kind: 'invalid_signature', invoiceId };
    }

    const [payment] = await this.database
      .select()
      .from(payments)
      .where(eq(payments.id, invoiceId))
      .limit(1);

    if (!payment) {
      return { kind: 'payment_not_found', invoiceId };
    }

    if (normalizeAmount(payment.amount) !== normalizeAmount(payload.OutSum)) {
      return { kind: 'amount_mismatch', invoiceId };
    }

    if (payment.status === 'paid') {
      const grant = await this.accessService.grantAccess({
        telegramUserId: payment.telegramUserId,
        paymentId: payment.id,
      });

      return {
        kind: 'accepted',
        invoiceId,
        grant,
        alreadyPaid: true,
      };
    }

    const now = new Date();

    await this.database
      .update(payments)
      .set({
        status: 'paid',
        paidAt: now,
        updatedAt: now,
      })
      .where(eq(payments.id, payment.id));

    const grant = await this.accessService.grantAccess({
      telegramUserId: payment.telegramUserId,
      paymentId: payment.id,
    });

    return {
      kind: 'accepted',
      invoiceId,
      grant,
      alreadyPaid: false,
    };
  }

  private async findFreshPendingPayment(
    telegramUserId: number,
    now: Date,
  ): Promise<Payment | undefined> {
    const [payment] = await this.database
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.telegramUserId, telegramUserId),
          eq(payments.status, 'pending'),
          gt(payments.expiresAt, now),
        ),
      )
      .orderBy(desc(payments.createdAt))
      .limit(1);

    return payment;
  }

  private async createNewPayment(telegramUserId: number, now: Date): Promise<PaymentLinkResult> {
    const [payment] = await this.database
      .insert(payments)
      .values({
        telegramUserId,
        amount: entrypoints.product.amountRub,
        currency: entrypoints.product.currency,
        description: entrypoints.product.description,
        status: 'pending',
        expiresAt: addMinutes(now, entrypoints.limits.pendingPaymentTtlMinutes),
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const paymentUrl = createPaymentUrl({
      invoiceId: payment.id,
      amount: payment.amount,
      description: payment.description,
    });

    const [updatedPayment] = await this.database
      .update(payments)
      .set({
        paymentUrl,
        updatedAt: now,
      })
      .where(eq(payments.id, payment.id))
      .returning();

    await this.database
      .update(users)
      .set({
        lastPaymentLinkCreatedAt: now,
        updatedAt: now,
      })
      .where(eq(users.telegramId, telegramUserId));

    return {
      kind: 'new_payment',
      payment: updatedPayment,
      paymentUrl,
    };
  }
}
