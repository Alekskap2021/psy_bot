import {
  bigint,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'paid',
  'failed',
  'expired',
])

export const accessStatusEnum = pgEnum('access_status', [
  'active',
  'expired',
  'revoked',
])

export const users = pgTable('users', {
  telegramId: bigint('telegram_id', { mode: 'number' }).primaryKey(),
  username: varchar('username', { length: 255 }),
  firstName: text('first_name'),
  lastName: text('last_name'),
  lastPaymentLinkCreatedAt: timestamp('last_payment_link_created_at', {
    withTimezone: true,
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const payments = pgTable(
  'payments',
  {
    id: serial('id').primaryKey(),
    telegramUserId: bigint('telegram_user_id', { mode: 'number' })
      .notNull()
      .references(() => users.telegramId),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('RUB'),
    description: text('description').notNull(),
    status: paymentStatusEnum('status').notNull().default('pending'),
    paymentUrl: text('payment_url'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userStatusIdx: index('payments_user_status_idx').on(
      table.telegramUserId,
      table.status,
    ),
    createdAtIdx: index('payments_created_at_idx').on(table.createdAt),
  }),
)

export const accessGrants = pgTable(
  'access_grants',
  {
    id: serial('id').primaryKey(),
    telegramUserId: bigint('telegram_user_id', { mode: 'number' })
      .notNull()
      .references(() => users.telegramId),
    paymentId: integer('payment_id').references(() => payments.id),
    channelId: varchar('channel_id', { length: 64 }).notNull(),
    inviteLink: text('invite_link').notNull(),
    inviteLinkExpiresAt: timestamp('invite_link_expires_at', {
      withTimezone: true,
    }).notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    status: accessStatusEnum('status').notNull().default('active'),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userStatusIdx: index('access_grants_user_status_idx').on(
      table.telegramUserId,
      table.status,
    ),
    expirationIdx: index('access_grants_expiration_idx').on(
      table.status,
      table.endsAt,
    ),
  }),
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
export type AccessGrant = typeof accessGrants.$inferSelect
export type NewAccessGrant = typeof accessGrants.$inferInsert
