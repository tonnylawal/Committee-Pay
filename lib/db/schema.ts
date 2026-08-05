import { integer, varchar, decimal, timestamp, boolean, text, pgTable } from 'drizzle-orm/pg-core'

export const paymentLinks = pgTable('payment_links', {
  id: integer('id').primaryKey(),
  customPath: varchar('custom_path', { length: 255 }).unique().notNull(),
  amountUsd: decimal('amount_usd', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isActive: boolean('is_active').default(true),
})

export const payments = pgTable('payments', {
  id: integer('id').primaryKey(),
  linkId: integer('link_id').notNull(),
  referenceId: varchar('reference_id', { length: 255 }).unique(),
  amountKes: decimal('amount_kes', { precision: 10, scale: 2 }).notNull(),
  amountUsd: decimal('amount_usd', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  customerEmail: varchar('customer_email', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type PaymentLink = typeof paymentLinks.$inferSelect
export type NewPaymentLink = typeof paymentLinks.$inferInsert

export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
