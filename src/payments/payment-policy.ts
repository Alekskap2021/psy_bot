import { entrypoints } from '../config/entrypoints'
import { addMinutes } from '../utils/time'

export function getPaymentRateLimitUntil(
  lastPaymentLinkCreatedAt: Date | null | undefined,
): Date | undefined {
  if (!lastPaymentLinkCreatedAt) {
    return undefined
  }

  return addMinutes(
    lastPaymentLinkCreatedAt,
    entrypoints.limits.paymentLinkRateLimitMinutes,
  )
}

export function isRateLimited(params: {
  lastPaymentLinkCreatedAt: Date | null | undefined
  now: Date
}): boolean {
  const rateLimitUntil = getPaymentRateLimitUntil(params.lastPaymentLinkCreatedAt)

  return Boolean(rateLimitUntil && rateLimitUntil > params.now)
}

export function isFreshPendingPayment(params: {
  status: string
  expiresAt: Date
  paymentUrl: string | null
  now: Date
}): boolean {
  return (
    params.status === 'pending' &&
    params.expiresAt > params.now &&
    Boolean(params.paymentUrl)
  )
}
