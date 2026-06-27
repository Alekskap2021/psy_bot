import type { User } from 'grammy/types'
import { eq } from 'drizzle-orm'

import type { Database } from '../db/client'
import { users } from '../db/schema'

type TelegramProfile = Pick<
  User,
  'id' | 'username' | 'first_name' | 'last_name'
>

export class UserService {
  constructor(private readonly database: Database) {}

  async upsertFromTelegram(profile: TelegramProfile): Promise<void> {
    const now = new Date()

    await this.database
      .insert(users)
      .values({
        telegramId: profile.id,
        username: profile.username ?? null,
        firstName: profile.first_name ?? null,
        lastName: profile.last_name ?? null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: users.telegramId,
        set: {
          username: profile.username ?? null,
          firstName: profile.first_name ?? null,
          lastName: profile.last_name ?? null,
          updatedAt: now,
        },
      })
  }

  async markPaymentLinkCreated(telegramId: number, createdAt: Date): Promise<void> {
    await this.database
      .update(users)
      .set({
        lastPaymentLinkCreatedAt: createdAt,
        updatedAt: createdAt,
      })
      .where(eq(users.telegramId, telegramId))
  }
}
