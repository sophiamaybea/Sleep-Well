import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { db, runMigrations } from "./db";
import { exhibits, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  seedSiteContent,
  reseedSiteContent,
  seedWelcomeNotifications,
} from "./seedContent";
import { startAgentScheduler } from "./lib/agentScheduler";
import atelierRouter from "./routes/atelier";
const app = express();
const httpServer = createServer(app);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https://*.supabase.co", "https://api-m.paypal.com", "https://api-m.sandbox.paypal.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }),
);
// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: any, res: any) => {
    res.status(429).json({
      message: "You're moving fast! Please wait a moment before trying again.",
      retryAfter: 30,
    });
  },
});
// Rate limit for auth routes - 10 attempts per 5 minutes
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: any, res: any) => {
    res.status(429).json({
      message: "Too many sign-in attempts. Please wait before trying again.",
      retryAfter: 60,
    });
  },
});
app.use("/api", apiLimiter);
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);
app.use("/api/editor-onboarding", authLimiter);
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const jsonStr = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${jsonStr.length > 200 ? jsonStr.slice(0, 200) + "..." : jsonStr}`;
      }
      log(logLine);
    }
  });
  next();
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
process.on("SIGTERM", () => {
  console.error("SIGTERM received");
});
process.on("SIGINT", () => {
  console.error("SIGINT received");
});
process.on("SIGHUP", () => {
  console.error("SIGHUP received");
});
// Diagnostic endpoint — GUARDED: editor_in_chief only
import { pool } from "./db";
app.get("/api/debug/db", async (req: any, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user || req.user.role !== "editor_in_chief") {
    return res.status(401).json({ error: "Unauthorised" });
  }
  try {
    const tables = await pool.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`);
    const writings = await pool.query(`SELECT count(*) as total, count(*) FILTER (WHERE is_published = true) as published FROM writings`);
    const siteContent = await pool.query(`SELECT count(*) FROM site_content`);
    res.json({ tables: tables.rows.map((r: any) => r.tablename), writings: writings.rows[0], siteContent: siteContent.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});
(async () => {
  // Simple health endpoint for uptime checks and keep-warm pings
  app.get("/health", (_req, res) => { res.json({ status: "ok", ts: Date.now() }); });
app.use("/api/atelier", atelierRouter);
  await registerRoutes(httpServer, app);
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }
  async function seedExhibits() {
    const existing = await db
      .select()
      .from(exhibits)
      .where(eq(exhibits.slug, "metaphor-as-migration"));
    if (existing.length === 0) {
      await db.insert(exhibits).values({
        title: "Metaphor as Migration",
        slug: "metaphor-as-migration",
        subtitle: "What moves through you when you let an image travel",
        price: 0,
        isPublished: true,
      });
      log("Seeded exhibit: Metaphor as Migration");
    }
  }
  await runMigrations().catch((err) => console.error("Migration failed:", err));
  await seedExhibits().catch((err) =>
    console.error("Seed exhibits failed:", err),
  );
  await seedSiteContent().catch((err) =>
    console.error("Seed site content failed:", err),
  );
  await seedWelcomeNotifications().catch((err) =>
    console.error("Seed notifications failed:", err),
  );
  // NOTE: Hardcoded role demotion removed — do not re-add.
  // Manage roles via the EIC dashboard or direct DB update.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
      startAgentScheduler();
    },
  );
  // T45/T42: Startup env-var audit — emit loud warnings for missing SMTP / PayPal credentials
  // These vars must be set in Render environment variables before production launch.
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(
      "[startup] WARNING: SMTP_USER and/or SMTP_PASS not set — " +
      "service-inquiry email notifications will be skipped. " +
      "Inquiries are still saved to the database. " +
      "Set SMTP_USER=your@gmail.com and SMTP_PASS=your-app-password in Render env vars."
    );
  }
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.warn(
      "[startup] WARNING: PAYPAL_CLIENT_ID and/or PAYPAL_CLIENT_SECRET not set — " +
      "all payment routes (/api/editorial-orders/create-order, /api/editorial-orders/capture-order) " +
      "will throw a 500 error when called. " +
      "Set these in Render environment variables before enabling editorial payment flows."
    );
  }
  // FIX(Finding 3): SESSION_SECRET must be set — unsigned sessions are a security risk.
  // Throw hard so Render surfaces this as a failed deploy, not a silent vulnerability.
  if (!process.env.SESSION_SECRET) {
    throw new Error(
      "[CRITICAL] SESSION_SECRET env var is not set. " +
      "Sessions cannot be signed securely. " +
      "Set SESSION_SECRET in Render environment variables and redeploy."
    );
  }
  // Keep-warm: prevent Render free-tier cold starts by pinging the public URL every 13 minutes.
  // IMPORTANT: APP_URL *must* be set in Render environment variables for this to work.
  // Without it, no interval is scheduled and Render will sleep the service after 15 min inactivity.
  if (process.env.NODE_ENV === "production") {
    const appUrl = process.env.APP_URL;
    if (!appUrl) {
      // T41: Emit a loud startup warning — do NOT fall back to localhost
      console.warn(
        "[keep-warm] WARNING: APP_URL env var not set — keep-warm ping will not work. " +
        "Set APP_URL=https://your-render-url.onrender.com in Render environment variables. " +
        "Without this, Render will sleep the service after 15 minutes of inactivity."
      );
      // No setInterval scheduled — a localhost ping would be meaningless on Render
    } else {
      // T41: Only schedule the keep-warm interval when APP_URL is actually set
      const KEEP_WARM_URL = `${appUrl}/health`;
      const KEEP_WARM_INTERVAL = 13 * 60 * 1000; // 13 minutes — under Render's 15-min sleep threshold
      const doWarmPing = async () => {
        try {
          const res = await fetch(KEEP_WARM_URL);
          log(`Keep-warm ping OK (${res.status}) → ${KEEP_WARM_URL}`, "keep-warm");
        } catch (err) {
          log(`Keep-warm ping FAILED → ${KEEP_WARM_URL} — ${err}`, "keep-warm");
        }
      };
      // Fire once on boot (after 10s delay) to confirm URL is reachable
      setTimeout(doWarmPing, 10_000);
      setInterval(doWarmPing, KEEP_WARM_INTERVAL);
      log(`Keep-warm interval started (13 min, targeting ${KEEP_WARM_URL})`, "keep-warm");
    }
  }
})();
