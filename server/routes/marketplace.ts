import { type Express } from "express";
import { db, pool } from "../db";
import {
  writerServices,
  serviceBookings,
  tipJars,
  tipTransactions,
} from "@shared/schema";
import { eq } from "drizzle-orm";

const PAYPAL_API =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new Error(
      "[PayPal] PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set in environment variables."
    );
  }
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[PayPal] Failed to get access token: ${text}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export function registerMarketplaceRoutes(app: Express) {
  app.get("/api/marketplace/services", async (_req, res) => {
    try {
      const services = await db
        .select()
        .from(writerServices)
        .where(eq(writerServices.isActive, true));
      return res.json(services);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/marketplace/services/my", async (req: any, res) => {
    if (!req.isAuthenticated() || !req.user) return res.status(401).json({ error: "Unauthorized" });
    try {
      const services = await db.select().from(writerServices).where(eq(writerServices.authorId, req.user.id));
      return res.json(services);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.post("/api/marketplace/services", async (req: any, res) => {
    if (!req.isAuthenticated() || !req.user || !["writer", "editor", "admin"].includes(req.user.role)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const { title, description, serviceType, pricePence, deliveryDays } = req.body;
      const [service] = await db.insert(writerServices).values({
        authorId: req.user.id,
        title,
        description: description || "",
        serviceType: serviceType || "manuscript_feedback",
        pricePence: Number(pricePence),
        deliveryDays: deliveryDays || 7,
        isActive: true,
      }).returning();
      return res.json(service);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to create service" });
    }
  });

  app.post("/api/marketplace/services/:id/book", async (req: any, res) => {
    if (!req.isAuthenticated() || !req.user) return res.status(401).json({ error: "Unauthorized" });
    try {
      const [service] = await db.select().from(writerServices).where(eq(writerServices.id, req.params.id));
      if (!service) return res.status(404).json({ error: "Service not found" });

      const [booking] = await db.insert(serviceBookings).values({
        serviceId: service.id,
        clientId: req.user.id,
        pricePence: service.pricePence,
        status: "pending_payment",
      }).returning();

      const token = await getPayPalAccessToken();
      const gbpAmount = (service.pricePence / 100).toFixed(2);
      const host = req.get("host");
      const protocol = req.protocol;

      const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{
            amount: { currency_code: "GBP", value: gbpAmount },
            description: service.title,
          }],
          application_context: {
            brand_name: "The Page Gallery Journal",
            return_url: `${protocol}://${host}/marketplace?success=true&bookingId=${booking.id}`,
            cancel_url: `${protocol}://${host}/marketplace?canceled=true`,
          }
        }),
      });

      if (!orderRes.ok) throw new Error(await orderRes.text());
      const order = await orderRes.json();

      await pool.query("UPDATE service_bookings SET paypal_order_id = $1 WHERE id = $2", [order.id, booking.id]);
      return res.json({ orderId: order.id, bookingId: booking.id, checkoutUrl: order.links.find((l: any) => l.rel === "approve")?.href });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to create booking" });
    }
  });

  app.post("/api/marketplace/services/bookings/:bookingId/capture", async (req: any, res) => {
    if (!req.isAuthenticated() || !req.user) return res.status(401).json({ error: "Unauthorized" });
    try {
      const result = await pool.query("SELECT * FROM service_bookings WHERE id = $1", [req.params.bookingId]);
      const booking = result.rows[0];
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      const token = await getPayPalAccessToken();
      const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${booking.paypal_order_id}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!captureRes.ok) throw new Error(await captureRes.text());
      const capture = await captureRes.json();
      await pool.query("UPDATE service_bookings SET status = 'paid', payment_confirmed = true, paid_at = now() WHERE id = $1", [booking.id]);
      return res.json({ success: true, capture });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to capture payment" });
    }
  });

  app.get("/api/marketplace/tip-jar/:authorId", async (req, res) => {
    try {
      const [jar] = await db.select().from(tipJars).where(eq(tipJars.authorId, req.params.authorId));
      return res.json(jar || null);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch tip jar" });
    }
  });

  app.post("/api/marketplace/tip-jar", async (req: any, res) => {
    if (!req.isAuthenticated() || !req.user) return res.status(401).json({ error: "Unauthorized" });
    try {
      const { isActive, message, suggestedAmountPence } = req.body;
      const [existing] = await db.select().from(tipJars).where(eq(tipJars.authorId, req.user.id));
      if (existing) {
        const [jar] = await db.update(tipJars).set({ 
          isActive: !!isActive, 
          message: message || "Buy me a coffee ☕", 
          suggestedAmountPence: Number(suggestedAmountPence) || 300 
        }).where(eq(tipJars.authorId, req.user.id)).returning();
        return res.json(jar);
      } else {
        const [jar] = await db.insert(tipJars).values({
          authorId: req.user.id,
          isActive: !!isActive,
          message: message || "Buy me a coffee ☕",
          suggestedAmountPence: Number(suggestedAmountPence) || 300,
        }).returning();
        return res.json(jar);
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update tip jar" });
    }
  });

  app.post("/api/marketplace/tip", async (req: any, res) => {
    if (!req.isAuthenticated() || !req.user) return res.status(401).json({ error: "Unauthorized" });
    try {
      const { authorId, amountPence } = req.body;
      const [jar] = await db.select().from(tipJars).where(eq(tipJars.authorId, authorId));
      if (!jar || !jar.isActive) return res.status(404).json({ error: "Tip jar not found" });

      const pence = Number(amountPence);
      if (!pence || pence < 50) return res.status(400).json({ error: "Minimum tip 50p" });

      const [tx] = await db.insert(tipTransactions).values({
        tipJarId: jar.id,
        tipperId: req.user.id,
        amountPence: pence,
      }).returning();

      const token = await getPayPalAccessToken();
      const gbpAmount = (pence / 100).toFixed(2);
      const host = req.get("host");
      const protocol = req.protocol;

      const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{
            amount: { currency_code: "GBP", value: gbpAmount },
            description: "Tip for writer",
          }],
          application_context: {
            brand_name: "The Page Gallery Journal",
            return_url: `${protocol}://${host}/marketplace?tipSuccess=true&txId=${tx.id}`,
            cancel_url: `${protocol}://${host}/marketplace?canceled=true`,
          }
        }),
      });

      if (!orderRes.ok) throw new Error(await orderRes.text());
      const order = await orderRes.json();

      await pool.query("UPDATE tip_transactions SET paypal_order_id = $1 WHERE id = $2", [order.id, tx.id]);
      return res.json({ orderId: order.id, transactionId: tx.id, checkoutUrl: order.links.find((l: any) => l.rel === "approve")?.href });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to create tip order" });
    }
  });

  app.post("/api/marketplace/tips/transactions/:txId/capture", async (req: any, res) => {
    if (!req.isAuthenticated() || !req.user) return res.status(401).json({ error: "Unauthorized" });
    try {
      const result = await pool.query("SELECT * FROM tip_transactions WHERE id = $1", [req.params.txId]);
      const tx = result.rows[0];
      if (!tx) return res.status(404).json({ error: "Transaction not found" });

      const token = await getPayPalAccessToken();
      const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${tx.paypal_order_id}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!captureRes.ok) throw new Error(await captureRes.text());
      const capture = await captureRes.json();
      await pool.query("UPDATE tip_transactions SET payment_confirmed = true WHERE id = $1", [tx.id]);
      return res.json({ success: true, capture });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to capture tip" });
    }
  });
}
