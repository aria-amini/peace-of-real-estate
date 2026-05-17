CREATE EXTENSION IF NOT EXISTS "pg_trgm";
--> statement-breakpoint
CREATE TABLE "listing" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"slug" varchar(128) NOT NULL,
	"title" text NOT NULL,
	"city" varchar(80) NOT NULL,
	"state" varchar(2) NOT NULL,
	"property_type" varchar(40) NOT NULL,
	"bedrooms" integer NOT NULL,
	"bathrooms" integer NOT NULL,
	"square_feet" integer NOT NULL,
	"list_price" integer NOT NULL,
	"status" varchar(40) NOT NULL,
	"vibe_summary" text NOT NULL,
	"hero_image_url" text,
	"swipe_score" integer DEFAULT 50 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_point" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"listing_id" varchar(64) NOT NULL,
	"recorded_at" timestamp NOT NULL,
	"price" integer NOT NULL,
	"event_type" varchar(40) NOT NULL,
	"title" text NOT NULL,
	CONSTRAINT "price_point_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX "listing_slug_index" ON "listing" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "listing_swipe_score_index" ON "listing" USING btree ("swipe_score" int4_ops);--> statement-breakpoint
CREATE INDEX "listing_price_index" ON "listing" USING btree ("list_price");--> statement-breakpoint
CREATE INDEX "listing_search_trigram_index" ON "listing" USING gin ((title || ' ' || city || ' ' || state) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "price_point_listing_id_index" ON "price_point" USING btree ("listing_id");
