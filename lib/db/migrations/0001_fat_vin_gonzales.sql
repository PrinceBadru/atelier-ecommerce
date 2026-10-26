CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"preferred_categories" text[] DEFAULT '{}'::text[] NOT NULL,
	"style_affinities" text[] DEFAULT '{}'::text[] NOT NULL,
	"taste_notes" text,
	"preference_embedding" vector(768),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "access_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "refresh_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "scope" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "id_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;