import type { Bot } from 'grammy'
import { and, asc, eq, gt, lte } from 'drizzle-orm'

import { entrypoints } from '../config/entrypoints'
import type { Database } from '../db/client'
import { accessGrants, type AccessGrant } from '../db/schema'
import { addDays, addMinutes, secondsFromDate } from '../utils/time'

type TelegramApi = Bot['api']

export class AccessService {
  constructor(
    private readonly database: Database,
    private readonly telegramApi: TelegramApi,
  ) {}

  async getActiveAccess(telegramUserId: number): Promise<AccessGrant | undefined> {
    const [grant] = await this.database
      .select()
      .from(accessGrants)
      .where(
        and(
          eq(accessGrants.telegramUserId, telegramUserId),
          eq(accessGrants.status, 'active'),
          gt(accessGrants.endsAt, new Date()),
        ),
      )
      .orderBy(asc(accessGrants.endsAt))
      .limit(1)

    return grant
  }

  async getOrRefreshInviteLink(telegramUserId: number): Promise<AccessGrant | undefined> {
    const grant = await this.getActiveAccess(telegramUserId)

    if (!grant) {
      return undefined
    }

    if (grant.inviteLinkExpiresAt > new Date()) {
      return grant
    }

    const refreshed = await this.createTelegramInviteLink()
    const now = new Date()

    const [updatedGrant] = await this.database
      .update(accessGrants)
      .set({
        inviteLink: refreshed.inviteLink,
        inviteLinkExpiresAt: refreshed.expiresAt,
        updatedAt: now,
      })
      .where(eq(accessGrants.id, grant.id))
      .returning()

    return updatedGrant
  }

  async grantAccess(params: {
    telegramUserId: number
    paymentId: number
  }): Promise<AccessGrant> {
    const existingGrant = await this.getOrRefreshInviteLink(params.telegramUserId)

    if (existingGrant) {
      return existingGrant
    }

    const now = new Date()
    const invite = await this.createTelegramInviteLink()

    const [grant] = await this.database
      .insert(accessGrants)
      .values({
        telegramUserId: params.telegramUserId,
        paymentId: params.paymentId,
        channelId: entrypoints.telegram.privateChannelId,
        inviteLink: invite.inviteLink,
        inviteLinkExpiresAt: invite.expiresAt,
        startsAt: now,
        endsAt: addDays(now, entrypoints.product.accessDurationDays),
        status: 'active',
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    return grant
  }

  async expireDueAccesses(): Promise<number> {
    const now = new Date()
    const dueGrants = await this.database
      .select()
      .from(accessGrants)
      .where(and(eq(accessGrants.status, 'active'), lte(accessGrants.endsAt, now)))
      .orderBy(asc(accessGrants.endsAt))
      .limit(50)

    let expiredCount = 0

    for (const grant of dueGrants) {
      await this.removeUserFromChannel(grant.telegramUserId)

      await this.database
        .update(accessGrants)
        .set({
          status: 'expired',
          revokedAt: now,
          updatedAt: now,
        })
        .where(eq(accessGrants.id, grant.id))

      expiredCount += 1
    }

    return expiredCount
  }

  private async createTelegramInviteLink(): Promise<{
    inviteLink: string
    expiresAt: Date
  }> {
    const expiresAt = addMinutes(new Date(), entrypoints.product.inviteLinkTtlMinutes)
    const link = await this.telegramApi.createChatInviteLink(
      entrypoints.telegram.privateChannelId,
      {
        expire_date: secondsFromDate(expiresAt),
        member_limit: 1,
      },
    )

    return {
      inviteLink: link.invite_link,
      expiresAt,
    }
  }

  private async removeUserFromChannel(telegramUserId: number): Promise<void> {
    await this.telegramApi.banChatMember(
      entrypoints.telegram.privateChannelId,
      telegramUserId,
    )

    await this.telegramApi.unbanChatMember(
      entrypoints.telegram.privateChannelId,
      telegramUserId,
      { only_if_banned: true },
    )
  }
}
