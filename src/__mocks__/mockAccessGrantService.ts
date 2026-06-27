export const mockAccessGrant = {
    id: 1,
    telegramUserId: 0,
    paymentId: null,
    channelId: '-1000000000000',
    inviteLink: 'https://t.me/+test-invite-link',
    inviteLinkExpiresAt: new Date(Date.now() + 30 * 60_000),
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 30 * 24 * 60 * 60_000),
    status: 'active' as const,
    revokedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
}

export const mockAccessService = {
    async getActiveAccess() {
        return undefined
    },
    async getOrRefreshInviteLink() {
        return undefined
    },
    async grantAccess() {
        return mockAccessGrant
    },
    async expireDueAccesses() {
        return 0
    },
}