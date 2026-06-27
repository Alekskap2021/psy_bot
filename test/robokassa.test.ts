import { createHash } from 'node:crypto'

import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('robokassa signatures', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.BOT_TOKEN = 'bot-token'
    process.env.DATABASE_URL = 'postgres://user:pass@example.com/db'
    process.env.ROBOKASSA_MERCHANT_LOGIN = 'merchant'
    process.env.ROBOKASSA_PASSWORD_1 = 'password-1'
    process.env.ROBOKASSA_PASSWORD_2 = 'password-2'
    process.env.ROBOKASSA_TEST_MODE = 'true'
  })

  it('generates a payment URL with the expected password-1 signature', async () => {
    const { createPaymentUrl } = await import('../src/payments/robokassa')

    const url = new URL(
      createPaymentUrl({
        invoiceId: 42,
        amount: '100',
        description: 'Test payment',
      }),
    )

    expect(url.searchParams.get('SignatureValue')).toBe(
      md5('merchant:100.00:42:password-1'),
    )
    expect(url.searchParams.get('IsTest')).toBe('1')
  })

  it('validates ResultURL callbacks with the password-2 signature', async () => {
    const { verifyResultSignature } = await import('../src/payments/robokassa')

    expect(
      verifyResultSignature({
        OutSum: '100.00',
        InvId: '42',
        SignatureValue: md5('100.00:42:password-2'),
      }),
    ).toBe(true)

    expect(
      verifyResultSignature({
        OutSum: '100.00',
        InvId: '42',
        SignatureValue: md5('100.00:42:wrong-password'),
      }),
    ).toBe(false)
  })
})

function md5(value: string): string {
  return createHash('md5').update(value).digest('hex').toUpperCase()
}
