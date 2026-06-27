import type { AccessService } from '../access/access.service'
import type { PaymentService } from '../payments/payment.service'
import type { UserService } from './user.service'

export type BotServices = {
  accessService: AccessService
  paymentService: PaymentService
  userService: UserService
}
