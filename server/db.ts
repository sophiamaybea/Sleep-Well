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
    max: 10, // increased from 3 — T18
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
    try {
      await pool.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash varchar;
      `);
    } catch (e) { console.error("[migration] ALTER users password_hash failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name varchar;
      `);
    } catch (e) { console.error("[migration] ALTER users display_name failed:", e); }

    try {
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
    } catch (e) { console.error("[migration] CREATE submission_calls failed:", e); }

    try {
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
    } catch (e) { console.error("[migration] CREATE submission_call_responses failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS is_anonymous boolean NOT NULL DEFAULT false;
      `);
    } catch (e) { console.error("[migration] ALTER users is_anonymous failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS has_completed_onboarding boolean NOT NULL DEFAULT false;
      `);
    } catch (e) { console.error("[migration] ALTER users has_completed_onboarding failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE writings ADD COLUMN IF NOT EXISTS marginalia_visibility text NOT NULL DEFAULT 'public';
      `);
    } catch (e) { console.error("[migration] ALTER writings marginalia_visibility failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE writings ADD COLUMN IF NOT EXISTS gallery_opt_in boolean NOT NULL DEFAULT false;
      `);
    } catch (e) { console.error("[migration] ALTER writings gallery_opt_in failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE writings ADD COLUMN IF NOT EXISTS gallery_opt_in_at timestamp;
      `);
    } catch (e) { console.error("[migration] ALTER writings gallery_opt_in_at failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE submission_calls ADD COLUMN IF NOT EXISTS theme text;
      `);
    } catch (e) { console.error("[migration] ALTER submission_calls theme failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE submission_calls ADD COLUMN IF NOT EXISTS prompt text;
      `);
    } catch (e) { console.error("[migration] ALTER submission_calls prompt failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE submission_calls ADD COLUMN IF NOT EXISTS issue_id varchar;
      `);
    } catch (e) { console.error("[migration] ALTER submission_calls issue_id failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE submission_calls ADD COLUMN IF NOT EXISTS starts_at timestamp;
      `);
    } catch (e) { console.error("[migration] ALTER submission_calls starts_at failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE submission_calls ADD COLUMN IF NOT EXISTS ends_at timestamp;
      `);
    } catch (e) { console.error("[migration] ALTER submission_calls ends_at failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE submission_calls ADD COLUMN IF NOT EXISTS flag_limit integer NOT NULL DEFAULT 3;
      `);
    } catch (e) { console.error("[migration] ALTER submission_calls flag_limit failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE submission_calls ADD COLUMN IF NOT EXISTS created_by_id varchar;
      `);
    } catch (e) { console.error("[migration] ALTER submission_calls created_by_id failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE submission_calls ALTER COLUMN editor_id DROP NOT NULL;
      `);
    } catch (e) { console.error("[migration] ALTER submission_calls editor_id DROP NOT NULL failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE submission_calls ALTER COLUMN description DROP NOT NULL;
      `);
    } catch (e) { console.error("[migration] ALTER submission_calls description DROP NOT NULL failed:", e); }

    // Circles feature
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS circles (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          name text NOT NULL,
          description text DEFAULT '',
          created_by_id varchar NOT NULL REFERENCES users(id),
          created_at timestamp DEFAULT now()
        );
      `);
    } catch (e) { console.error("[migration] CREATE circles failed:", e); }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS circle_members (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          circle_id varchar NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
          user_id varchar NOT NULL REFERENCES users(id),
          role text NOT NULL DEFAULT 'member',
          joined_at timestamp DEFAULT now()
        );
      `);
    } catch (e) { console.error("[migration] CREATE circle_members failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE writings ADD COLUMN IF NOT EXISTS circle_id varchar REFERENCES circles(id);
      `);
    } catch (e) { console.error("[migration] ALTER writings circle_id failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE circles ADD COLUMN IF NOT EXISTS theme text;
      `);
    } catch (e) { console.error("[migration] ALTER circles theme failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE circles ADD COLUMN IF NOT EXISTS max_members integer NOT NULL DEFAULT 5;
      `);
    } catch (e) { console.error("[migration] ALTER circles max_members failed:", e); }

    try {
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
    } catch (e) { console.error("[migration] CREATE site_content failed:", e); }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS appreciations (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id varchar NOT NULL REFERENCES users(id),
          writing_id varchar NOT NULL REFERENCES writings(id),
          created_at timestamp DEFAULT now(),
          UNIQUE(user_id, writing_id)
        );
      `);
    } catch (e) { console.error("[migration] CREATE appreciations failed:", e); }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS letters (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id varchar NOT NULL REFERENCES users(id),
          writing_id varchar NOT NULL REFERENCES writings(id),
          content text NOT NULL,
          created_at timestamp DEFAULT now()
        );
      `);
    } catch (e) { console.error("[migration] CREATE letters failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE editor_notes ADD COLUMN IF NOT EXISTS note_type text NOT NULL DEFAULT 'general_feedback';
      `);
    } catch (e) { console.error("[migration] ALTER editor_notes note_type failed:", e); }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS editorial_waitlist (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          name text NOT NULL,
          email text NOT NULL UNIQUE,
          genre text NOT NULL DEFAULT 'poetry',
          manuscript_type text NOT NULL DEFAULT 'poetry_collection',
          estimated_word_count integer,
          brief text,
          status text NOT NULL DEFAULT 'pending',
          sophia_note text,
          quoted_price integer,
          payment_confirmed boolean NOT NULL DEFAULT false,
          paypal_order_id text,
          payment_token text,
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        );
      `);
    } catch (e) { console.error("[migration] CREATE editorial_waitlist failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE editorial_waitlist ADD COLUMN IF NOT EXISTS payment_token text;
      `);
    } catch (e) { console.error("[migration] ALTER editorial_waitlist payment_token failed:", e); }

    // Grove botanical social layer
    try {
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
    } catch (e) { console.error("[migration] CREATE grove_plants failed:", e); }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS grove_watering_sessions (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          plant_id varchar NOT NULL REFERENCES grove_plants(id),
          user_id varchar NOT NULL REFERENCES users(id),
          watered_at timestamp DEFAULT now(),
          notes text
        );
      `);
    } catch (e) { console.error("[migration] CREATE grove_watering_sessions failed:", e); }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS grove_connections (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          follower_id varchar NOT NULL REFERENCES users(id),
          following_id varchar NOT NULL REFERENCES users(id),
          created_at timestamp DEFAULT now()
        );
      `);
    } catch (e) { console.error("[migration] CREATE grove_connections failed:", e); }

    try {
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
    } catch (e) { console.error("[migration] CREATE grove_seed_packets failed:", e); }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          email text NOT NULL UNIQUE,
          subscribed_at timestamp with time zone DEFAULT now(),
          source text DEFAULT 'homepage'
        );
      `);
    } catch (e) { console.error("[migration] CREATE newsletter_subscribers failed:", e); }

    // Editorial tasks table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS editorial_tasks (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          title text NOT NULL,
          description text,
          assigned_editor_id varchar REFERENCES users(id),
          created_by_editor_id varchar NOT NULL REFERENCES users(id),
          status varchar(32) NOT NULL DEFAULT 'open',
          due_date timestamp,
          issue_id varchar,
          writing_id varchar REFERENCES writings(id),
          sort_order integer NOT NULL DEFAULT 0,
          task_type text NOT NULL DEFAULT 'ops',
          board_column text NOT NULL DEFAULT 'inbox',
          completed_at timestamp,
          notify_on_complete boolean NOT NULL DEFAULT true,
          priority text NOT NULL DEFAULT 'medium',
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        );
      `);
    } catch (e) { console.error("[migration] CREATE editorial_tasks failed:", e); }

    // Editorial threads table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS editorial_threads (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          subject text NOT NULL,
          writing_id varchar REFERENCES writings(id),
          created_by_editor_id varchar NOT NULL REFERENCES users(id),
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        );
      `);
    } catch (e) { console.error("[migration] CREATE editorial_threads failed:", e); }

    // Editorial thread messages table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS editorial_thread_messages (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          thread_id varchar NOT NULL REFERENCES editorial_threads(id) ON DELETE CASCADE,
          author_id varchar NOT NULL REFERENCES users(id),
          body text NOT NULL,
          created_at timestamp DEFAULT now()
        );
      `);
    } catch (e) { console.error("[migration] CREATE editorial_thread_messages failed:", e); }

    // Editor task comments table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS editor_task_comments (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          task_id varchar NOT NULL REFERENCES editorial_tasks(id) ON DELETE CASCADE,
          author_id varchar NOT NULL REFERENCES users(id),
          content text NOT NULL,
          created_at timestamp DEFAULT now()
        );
      `);
    } catch (e) { console.error("[migration] CREATE editor_task_comments failed:", e); }

    // Garden Walk submissions
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS garden_walk_submissions (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          writer_id varchar NOT NULL REFERENCES users(id),
          writing_id varchar NOT NULL REFERENCES writings(id),
          editor_id varchar REFERENCES users(id),
          status text NOT NULL DEFAULT 'submitted',
          writer_note text,
          editor_feedback text,
          walk_type text NOT NULL DEFAULT 'review',
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        );
      `);
    } catch (e) { console.error("[migration] CREATE garden_walk_submissions failed:", e); }

    // Writer-editor messages for Garden Walk feedback threads
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS garden_walk_messages (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          submission_id varchar NOT NULL REFERENCES garden_walk_submissions(id) ON DELETE CASCADE,
          sender_id varchar NOT NULL REFERENCES users(id),
          content text NOT NULL,
          message_type text NOT NULL DEFAULT 'feedback',
          created_at timestamp DEFAULT now()
        );
      `);
    } catch (e) { console.error("[migration] CREATE garden_walk_messages failed:", e); }

    try {
      await pool.query(`
        DO $$ BEGIN ALTER TABLE garden_walk_submissions ALTER COLUMN writing_id DROP NOT NULL; EXCEPTION WHEN others THEN NULL; END $$;
      `);
    } catch (e) { console.error("[migration] ALTER garden_walk_submissions writing_id nullable failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE garden_walk_submissions ADD COLUMN IF NOT EXISTS title text;
      `);
    } catch (e) { console.error("[migration] ALTER garden_walk_submissions title failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE garden_walk_submissions ADD COLUMN IF NOT EXISTS excerpt text;
      `);
    } catch (e) { console.error("[migration] ALTER garden_walk_submissions excerpt failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE garden_walk_submissions ADD COLUMN IF NOT EXISTS genre text;
      `);
    } catch (e) { console.error("[migration] ALTER garden_walk_submissions genre failed:", e); }

    try {
      await pool.query(`
        ALTER TABLE garden_walk_submissions ADD COLUMN IF NOT EXISTS sender_name text;
      `);
    } catch (e) { console.error("[migration] ALTER garden_walk_submissions sender_name failed:", e); }

    // Service inquiries table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS service_inquiries (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          name text NOT NULL,
          email text NOT NULL,
          service_type text NOT NULL,
          message text NOT NULL,
          created_at timestamp DEFAULT now()
        );
      `);
    } catch (e) { console.error("[migration] CREATE service_inquiries failed:", e); }

    // Rejection feedback requests table (T47)
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rejection_feedback_requests (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          writing_id varchar NOT NULL REFERENCES writings(id),
          author_id varchar NOT NULL REFERENCES users(id),
          tier text NOT NULL DEFAULT 'free',
          status text NOT NULL DEFAULT 'requested',
          paid_amount_pence integer NOT NULL DEFAULT 0,
          payment_confirmed boolean NOT NULL DEFAULT false,
          paypal_order_id text,
          editor_letter text,
          delivered_at timestamp,
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        );
      `);
    } catch (e) { console.error("[migration] CREATE rejection_feedback_requests failed:", e); }

    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Migration error:", error);
  }
}
