-- Migration: Add webflow_connections table

CREATE TABLE IF NOT EXISTS "webflow_connections" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "team_id" INTEGER NOT NULL REFERENCES "public"."teams"("id") ON DELETE CASCADE,
  "webflow_token" TEXT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "collection_id" VARCHAR(100) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);
