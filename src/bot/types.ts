import type { User } from 'grammy/types'

import type { AccessGrant } from '../db/schema'
import type {
  PaidCallbackResult,
  PaymentLinkResult,
} from '../payments/payment.service'
import type { RobokassaResultPayload } from '../payments/robokassa'

type TelegramProfile = Pick<
  User,
  'id' | 'username' | 'first_name' | 'last_name'
>

export type AccessServiceLike = {
  getActiveAccess(telegramUserId: number): Promise<AccessGrant | undefined>
  getOrRefreshInviteLink(
    telegramUserId: number,
  ): Promise<AccessGrant | undefined>
  grantAccess(params: {
    telegramUserId: number
    paymentId: number
  }): Promise<AccessGrant>
  expireDueAccesses(): Promise<number>
}

export type PaymentServiceLike = {
  requestPaymentLink(telegramUserId: number): Promise<PaymentLinkResult>
  handlePaidCallback(payload: RobokassaResultPayload): Promise<PaidCallbackResult>
}

export type UserServiceLike = {
  upsertFromTelegram(profile: TelegramProfile): Promise<void>
  markPaymentLinkCreated(telegramId: number, createdAt: Date): Promise<void>
}

export type BotServices = {
  accessService: AccessServiceLike
  paymentService: PaymentServiceLike
  userService: UserServiceLike
}
