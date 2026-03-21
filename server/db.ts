import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const databaseUrl =
  process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("Unexpected pool error:", err);
});
export const db = drizzle(pool, { schema });

// Run database migrations on startup
export async function runMigrations() {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash varchar;
    `);
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name varchar;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS submission_calls (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        editor_id varchar NOT NULL REFERENCES users(id),
        title text NOT NULL,
        description text NOT NULL,
        genre text,
        word_limit integer,
        deadline timestamp,
        status text NOT NULL DEFAULT 'open',
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS submission_call_responses (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        call_id varchar NOT NULL REFERENCES submission_calls(id),
        writer_id varchar NOT NULL REFERENCES users(id),
        writing_id varchar REFERENCES writings(id),
        note text,
        status text NOT NULL DEFAULT 'submitted',
        created_at timestamp DEFAULT now()
      );
    `);
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_anonymous boolean NOT NULL DEFAULT false;
    `);
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS has_completed_onboarding boolean NOT NULL DEFAULT false;
    `);
      await pool.query(`
            ALTER TABLE writings ADD COLUMN IF NOT EXISTS marginalia_visibility text NOT NULL DEFAULT 'public';
              `);
    await pool.query(`
      ALTER TABLE writings ADD COLUMN IF NOT EXISTS gallery_opt_in boolean NOT NULL DEFAULT false;
    `);
    await pool.query(`
      ALTER TABLE writings ADD COLUMN IF NOT EXISTS gallery_opt_in_at timestamp;
    `);
    await pool.query(`
      ALTER TABLE submission_calls ADD COLUMN IF NOT EXISTS theme text;
    `);
    await pool.query(`
      ALTER TABLE submission_calls ADD COLUMN IF NOT EXISTS prompt text;
    `);
    await pool.query(`
      ALTER TABLE submission_calls ADD COLUMN IF NOT EXISTS issue_id varchar;
    `);
    await pool.query(`
      ALTER TABLE submission_calls ADD COLUMN IF NOT EXISTS starts_at timestamp;
    `);
    await pool.query(`
      ALTER TABLE submission_calls ADD COLUMN IF NOT EXISTS ends_at timestamp;
    `);
    await pool.query(`
      ALTER TABLE submission_calls ADD COLUMN IF NOT EXISTS flag_limit integer NOT NULL DEFAULT 3;
    `);
    await pool.query(`
      ALTER TABLE submission_calls ADD COLUMN IF NOT EXISTS created_by_id varchar;
    `);
    await pool.query(`
            ALTER TABLE submission_calls ALTER COLUMN editor_id DROP NOT NULL;
        `);
    await pool.query(`
            ALTER TABLE submission_calls ALTER COLUMN description DROP NOT NULL;
        `);

    // Circles feature
    await pool.query(`
      CREATE TABLE IF NOT EXISTS circles (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        description text DEFAULT '',
        created_by_id varchar NOT NULL REFERENCES users(id),
        created_at timestamp DEFAULT now()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS circle_members (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        circle_id varchar NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
        user_id varchar NOT NULL REFERENCES users(id),
        role text NOT NULL DEFAULT 'member',
        joined_at timestamp DEFAULT now()
      );
    `);
    await pool.query(`
      ALTER TABLE writings ADD COLUMN IF NOT EXISTS circle_id varchar REFERENCES circles(id);
    `);
    await pool.query(`
      ALTER TABLE circles ADD COLUMN IF NOT EXISTS theme text;
    `);
    await pool.query(`
      ALTER TABLE circles ADD COLUMN IF NOT EXISTS max_members integer NOT NULL DEFAULT 5;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_content (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        page_key text NOT NULL,
        section_key text NOT NULL,
        content text NOT NULL,
        content_type text NOT NULL DEFAULT 'text',
        label text NOT NULL,
        group_label text,
        sort_order integer DEFAULT 0,
        updated_by varchar REFERENCES users(id),
        updated_at timestamp DEFAULT now(),
        created_at timestamp DEFAULT now(),
        UNIQUE(page_key, section_key)
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appreciations (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL REFERENCES users(id),
        writing_id varchar NOT NULL REFERENCES writings(id),
        created_at timestamp DEFAULT now(),
        UNIQUE(user_id, writing_id)
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS letters (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL REFERENCES users(id),
        writing_id varchar NOT NULL REFERENCES writings(id),
        content text NOT NULL,
        created_at timestamp DEFAULT now()
      );
    `);

    await pool.query(`
      ALTER TABLE editor_notes ADD COLUMN IF NOT EXISTS note_type text NOT NULL DEFAULT 'general_feedback';
    `);

    // Grove botanical social layer
    await pool.query(`
      ALTER TABLE editorial_waitlist ADD COLUMN IF NOT EXISTS payment_token text;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS grove_plants (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL REFERENCES users(id),
        name text NOT NULL,
        species text,
        nickname text,
        image_url text,
        watering_frequency_days integer DEFAULT 7,
        last_watered_at timestamp,
        next_water_due timestamp,
        is_public boolean NOT NULL DEFAULT false,
        notes text,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS grove_watering_sessions (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        plant_id varchar NOT NULL REFERENCES grove_plants(id),
        user_id varchar NOT NULL REFERENCES users(id),
        watered_at timestamp DEFAULT now(),
        notes text
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS grove_connections (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_id varchar NOT NULL REFERENCES users(id),
        following_id varchar NOT NULL REFERENCES users(id),
        created_at timestamp DEFAULT now()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS grove_seed_packets (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id varchar NOT NULL REFERENCES users(id),
        recipient_id varchar NOT NULL REFERENCES users(id),
        plant_id varchar REFERENCES grove_plants(id),
        message text,
        seed_type text NOT NULL,
        is_opened boolean NOT NULL DEFAULT false,
        created_at timestamp DEFAULT now()
      );
    `);
        await pool.query(`
      // Newsletter subscribers
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        email text NOT NULL UNIQUE,
        subscribed_at timestamp with time zone DEFAULT now(),
        source text DEFAULT 'homepage'
      );
    `);
    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Migration error:", error);
  }
}

// Auto-run migrations on module load
runMigrations();
