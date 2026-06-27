CREATE TYPE "public"."access_status" AS ENUM('active', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'expired');--> statement-breakpoint
CREATE TABLE "access_grants" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_user_id" bigint NOT NULL,
	"payment_id" integer,
	"channel_id" varchar(64) NOT NULL,
	"invite_link" text NOT NULL,
	"invite_link_expires_at" timestamp with time zone NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" "access_status" DEFAULT 'active' NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_user_id" bigint NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'RUB' NOT NULL,
	"description" text NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_url" text,
	"expires_at" timestamp with time zone NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"telegram_id" bigint PRIMARY KEY NOT NULL,
	"username" varchar(255),
	"first_name" text,
	"last_name" text,
	"last_payment_link_created_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_telegram_user_id_users_telegram_id_fk" FOREIGN KEY ("telegram_user_id") REFERENCES "public"."users"("telegram_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_telegram_user_id_users_telegram_id_fk" FOREIGN KEY ("telegram_user_id") REFERENCES "public"."users"("telegram_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "access_grants_user_status_idx" ON "access_grants" USING btree ("telegram_user_id","status");--> statement-breakpoint
CREATE INDEX "access_grants_expiration_idx" ON "access_grants" USING btree ("status","ends_at");--> statement-breakpoint
CREATE INDEX "payments_user_status_idx" ON "payments" USING btree ("telegram_user_id","status");--> statement-breakpoint
CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");