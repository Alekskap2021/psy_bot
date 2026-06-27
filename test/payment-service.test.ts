import { createHash } from 'node:crypto'

import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('PaymentService', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.BOT_TOKEN = 'bot-token'
    process.env.DATABASE_URL = 'postgres://user:pass@example.com/db'
    process.env.ROBOKASSA_MERCHANT_LOGIN = 'merchant'
    process.env.ROBOKASSA_PASSWORD_1 = 'password-1'
    process.env.ROBOKASSA_PASSWORD_2 = 'password-2'
    process.env.ROBOKASSA_TEST_MODE = 'true'
  })

  it('accepts duplicate paid callbacks without updating the payment again', async () => {
    const { PaymentService } = await import('../src/payments/payment.service')
    const payment = {
      id: 42,
      telegramUserId: 100500,
      amount: '100.00',
      status: 'paid',
    }
    const grant = {
      id: 7,
      telegramUserId: 100500,
      inviteLink: 'https://t.me/+invite',
      endsAt: new Date('2026-07-27T10:00:00.000Z'),
    }
    const database = createDatabaseMock([payment])
    const accessService = {
      grantAccess: vi.fn().mockResolvedValue(grant),
    }

    const service = new PaymentService(database, accessService as never)
    const result = await service.handlePaidCallback({
      OutSum: '100.00',
      InvId: '42',
      SignatureValue: md5('100.00:42:password-2'),
    })

    expect(result).toMatchObject({
      kind: 'accepted',
      alreadyPaid: true,
      invoiceId: 42,
    })
    expect(database.update).not.toHaveBeenCalled()
    expect(accessService.grantAccess).toHaveBeenCalledWith({
      telegramUserId: 100500,
      paymentId: 42,
    })
  })
})

function createDatabaseMock(selectResult: unknown[]) {
  const limit = vi.fn().mockResolvedValue(selectResult)
  const where = vi.fn(() => ({ limit }))
  const from = vi.fn(() => ({ where }))

  return {
    select: vi.fn(() => ({ from })),
    update: vi.fn(),
  } as never
}

function md5(value: string): string {
  return createHash('md5').update(value).digest('hex').toUpperCase()
}
