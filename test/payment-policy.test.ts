import { describe, expect, it } from 'vitest'

import {
  getPaymentRateLimitUntil,
  isFreshPendingPayment,
  isRateLimited,
} from '../src/payments/payment-policy'

describe('payment policy', () => {
  it('calculates a persistent payment link rate limit window', () => {
    const createdAt = new Date('2026-06-27T10:00:00.000Z')

    expect(getPaymentRateLimitUntil(createdAt)).toEqual(
      new Date('2026-06-27T10:05:00.000Z'),
    )
  })

  it('blocks a user while the rate limit window is active', () => {
    expect(
      isRateLimited({
        lastPaymentLinkCreatedAt: new Date('2026-06-27T10:00:00.000Z'),
        now: new Date('2026-06-27T10:04:59.000Z'),
      }),
    ).toBe(true)
  })

  it('reuses only pending payments with a non-expired URL', () => {
    expect(
      isFreshPendingPayment({
        status: 'pending',
        expiresAt: new Date('2026-06-27T10:30:00.000Z'),
        paymentUrl: 'https://pay.example',
        now: new Date('2026-06-27T10:00:00.000Z'),
      }),
    ).toBe(true)

    expect(
      isFreshPendingPayment({
        status: 'pending',
        expiresAt: new Date('2026-06-27T09:59:00.000Z'),
        paymentUrl: 'https://pay.example',
        now: new Date('2026-06-27T10:00:00.000Z'),
      }),
    ).toBe(false)
  })
})
