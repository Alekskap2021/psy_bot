import {mockAccessGrant} from "./mockAccessGrantService"

export const mockPaymentService = {
    async requestPaymentLink() {
        return {
            kind: 'new_payment' as const,
            payment: {
                id: 1,
                telegramUserId: 0,
                amount: '1990.00',
                currency: 'RUB',
                description: 'Тестовая оплата',
                status: 'pending' as const,
                paymentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                expiresAt: new Date(Date.now() + 30 * 60_000),
                paidAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            paymentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        }
    },
    async handlePaidCallback() {
        return {
            kind: 'accepted' as const,
            invoiceId: 1,
            grant: mockAccessGrant,
            alreadyPaid: false,
        }
    },
}