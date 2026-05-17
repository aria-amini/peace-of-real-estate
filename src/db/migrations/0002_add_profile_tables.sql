CREATE TABLE "consumers" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"zip_codes_json" jsonb,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "consumers_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE "consumer_questionnaires" (
	"id" text PRIMARY KEY NOT NULL,
	"consumer_id" text NOT NULL,
	"status" text NOT NULL,
	"weights_json" jsonb NOT NULL,
	"answers_json" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "consumer_questionnaires_consumer_id_fk" FOREIGN KEY ("consumer_id") REFERENCES "public"."consumers"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"agency" text,
	"experience" text,
	"bio" text,
	"zip_codes_json" jsonb,
	"services_json" jsonb,
	"peace_pact_signed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "agents_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE "agent_questionnaires" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"status" text NOT NULL,
	"weights_json" jsonb NOT NULL,
	"answers_json" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "agent_questionnaires_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX "consumers_user_id_index" ON "consumers" USING btree ("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "consumer_questionnaires_consumer_id_index" ON "consumer_questionnaires" USING btree ("consumer_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "agents_user_id_index" ON "agents" USING btree ("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "agent_questionnaires_agent_id_index" ON "agent_questionnaires" USING btree ("agent_id");
