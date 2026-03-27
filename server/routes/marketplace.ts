import { type Express } from "express";
import { db } from "../db";
import {
  writerServices,
  serviceBookings,
  tipJars,
  tipTransactions,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

// Env-check similar to editorialOrders.ts PayPal guard
function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "[Stripe] STRIPE_SECRET_KEY must be set in environment variables. Marketplace routes will not function without it."
    );
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia",
  });
}

export function registerMarketplaceRoutes(app: Express) {
  // ─── WRITER SERVICES ────────────────────────────────────────────────────────
  // POST /api/marketplace/services — authenticated writer/editor only
  app.post("/api/marketplace/services", async (req: any, res) => {
    if (
      !req.user ||
      (req.user.role !== "writer" &&
        req.user.role !== "editor" &&
        req.user.role !== "editor_in_chief")
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { title, description, serviceType, pricePence, deliveryDays } =
      req.body;
    if (!title || pricePence === undefined) {
      return res
        .status(400)
        .json({ error: "title and pricePence are required" });
    }
    try {
      const [service] = await db
        .insert(writerServices)
        .values({
          authorId: req.user.id,
          title,
          description: description || "",
          serviceType: serviceType || "manuscript_feedback",
          pricePence,
          deliveryDays: deliveryDays || 7,
          currency: "gbp",
          isActive: true,
        })
        .returning();
      res.json(service);
    } catch (err) {
      console.error("[marketplace] create service error:", err);
      res.status(500).json({ error: "Could not create service" });
    }
  });

  // GET /api/marketplace/services — public, returns all active services
  app.get("/api/marketplace/services", async (_req, res) => {
    try {
      const services = await db
        .select()
        .from(writerServices)
        .where(eq(writerServices.isActive, true))
        .orderBy(writerServices.createdAt);
      res.json(services);
    } catch (err) {
      console.error("[marketplace] list services error:", err);
      res.status(500).json({ error: "Could not fetch services" });
    }
  });

  // GET /api/marketplace/services/my — authenticated, user's own services
  app.get("/api/marketplace/services/my", async (req: any, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    try {
      const services = await db
        .select()
        .from(writerServices)
        .where(eq(writerServices.authorId, req.user.id));
      res.json(services);
    } catch (err) {
      console.error("[marketplace] my services error:", err);
      res.status(500).json({ error: "Could not fetch services" });
    }
  });

  // ─── SERVICE BOOKINGS ───────────────────────────────────────────────────────
  // POST /api/marketplace/bookings/create-checkout — authenticated user books a service
  app.post("/api/marketplace/bookings/create-checkout", async (req: any, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { serviceId, note } = req.body;
    if (!serviceId) return res.status(400).json({ error: "serviceId required" });
    try {
      const [service] = await db
        .select()
        .from(writerServices)
        .where(eq(writerServices.id, serviceId));
      if (!service || !service.isActive) {
        return res
          .status(404)
          .json({ error: "Service not found or inactive" });
      }
      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: service.currency,
              product_data: { name: service.title },
              unit_amount: service.pricePence,
            },
            quantity: 1,
          },
        ],
        success_url: `${req.headers.origin || "https://the-page-gallery.replit.app"}/marketplace?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || "https://the-page-gallery.replit.app"}/marketplace?cancelled=true`,
      });
      // Insert pending booking
      await db.insert(serviceBookings).values({
        serviceId,
        clientId: req.user.id,
        note: note || null,
        pricePence: service.pricePence,
        currency: service.currency,
        status: "pending_payment",
        stripeSessionId: session.id,
      });
      res.json({ sessionId: session.id, url: session.url });
    } catch (err) {
      console.error("[marketplace] create-checkout error:", err);
      res.status(500).json({ error: "Could not create checkout" });
    }
  });

  // POST /api/marketplace/bookings/webhook — Stripe webhook to confirm payment
  app.post(
    "/api/marketplace/bookings/webhook",
    async (req: any, res) => {
      const sig = req.headers["stripe-signature"];
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error(
          "[marketplace] STRIPE_WEBHOOK_SECRET not set. Cannot verify webhook."
        );
        return res.status(500).send("Webhook secret not configured");
      }
      try {
        const stripe = getStripeClient();
        const event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          await db
            .update(serviceBookings)
            .set({
              paymentConfirmed: true,
              status: "paid",
              paidAt: new Date(),
              stripePaymentIntentId: session.payment_intent as string,
            })
            .where(eq(serviceBookings.stripeSessionId, session.id));
        }
        res.json({ received: true });
      } catch (err: any) {
        console.error("[marketplace] webhook error:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }
  );

  // GET /api/marketplace/bookings — authenticated user's bookings
  app.get("/api/marketplace/bookings", async (req: any, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    try {
      const bookings = await db
        .select()
        .from(serviceBookings)
        .where(eq(serviceBookings.clientId, req.user.id))
        .orderBy(serviceBookings.createdAt);
      res.json(bookings);
    } catch (err) {
      console.error("[marketplace] bookings error:", err);
      res.status(500).json({ error: "Could not fetch bookings" });
    }
  });

  // ─── TIP JARS ───────────────────────────────────────────────────────────────
  // POST /api/marketplace/tip-jar — authenticated user activates/updates tip jar
  app.post("/api/marketplace/tip-jar", async (req: any, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { isActive, message, suggestedAmountPence } = req.body;
    try {
      const [existing] = await db
        .select()
        .from(tipJars)
        .where(eq(tipJars.authorId, req.user.id));
      if (existing) {
        const [updated] = await db
          .update(tipJars)
          .set({
            isActive: isActive !== undefined ? isActive : existing.isActive,
            message: message || existing.message,
            suggestedAmountPence:
              suggestedAmountPence || existing.suggestedAmountPence,
            updatedAt: new Date(),
          })
          .where(eq(tipJars.id, existing.id))
          .returning();
        return res.json(updated);
      }
      const [jar] = await db
        .insert(tipJars)
        .values({
          authorId: req.user.id,
          isActive: isActive !== undefined ? isActive : false,
          message: message || "Buy me a coffee ☕",
          suggestedAmountPence: suggestedAmountPence || 300,
        })
        .returning();
      res.json(jar);
    } catch (err) {
      console.error("[marketplace] tip-jar error:", err);
      res.status(500).json({ error: "Could not update tip jar" });
    }
  });

  // GET /api/marketplace/tip-jar/:authorId — public, fetches tip jar config
  app.get("/api/marketplace/tip-jar/:authorId", async (req, res) => {
    try {
      const [jar] = await db
        .select()
        .from(tipJars)
        .where(eq(tipJars.authorId, req.params.authorId));
      if (!jar || !jar.isActive) {
        return res.status(404).json({ error: "Tip jar not found or inactive" });
      }
      res.json(jar);
    } catch (err) {
      console.error("[marketplace] get tip jar error:", err);
      res.status(500).json({ error: "Could not fetch tip jar" });
    }
  });

  // POST /api/marketplace/tip — public (no auth required), create Stripe Checkout for tip
  app.post("/api/marketplace/tip", async (req, res) => {
    const { authorId, amountPence } = req.body;
    if (!authorId || !amountPence) {
      return res
        .status(400)
        .json({ error: "authorId and amountPence required" });
    }
    try {
      const [jar] = await db
        .select()
        .from(tipJars)
        .where(eq(tipJars.authorId, authorId));
      if (!jar || !jar.isActive) {
        return res.status(404).json({ error: "Tip jar not active" });
      }
      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: { name: `Tip for ${jar.message}` },
              unit_amount: amountPence,
            },
            quantity: 1,
          },
        ],
        success_url: `${req.headers.origin || "https://the-page-gallery.replit.app"}/profile/${authorId}?tip=success`,
        cancel_url: `${req.headers.origin || "https://the-page-gallery.replit.app"}/profile/${authorId}?tip=cancelled`,
      });
      // Record transaction (tipper is null = anonymous)
      await db.insert(tipTransactions).values({
        tipJarId: jar.id,
        tipperId: null,
        amountPence,
        currency: "gbp",
        stripeSessionId: session.id,
      });
      res.json({ sessionId: session.id, url: session.url });
    } catch (err) {
      console.error("[marketplace] tip error:", err);
      res.status(500).json({ error: "Could not create tip checkout" });
    }
  });
}
