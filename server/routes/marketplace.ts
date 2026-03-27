import { type Express } from "express";
import { db } from "../db";
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
      "[PayPal] PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set in environment variables. Marketplace routes cannot initialise."
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
  // —— WRITER SERVICES ——————————————————————————————————————————
  // POST /api/marketplace/services — authenticated writer/editor only
  app.post("/api/marketplace/services", async (req: any, res) => {
    if (
      !req.isAuthenticated() ||
      !req.user ||
      !(["writer", "editor", "admin"].includes(req.user.role))
    ) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const { title, description, scope, priceGbp } = req.body;
      const [service] = await db
        .insert(writerServices)
        .values({
          writerId: req.user.id,
          title,
          description,
          scope,
          priceGbp: String(priceGbp),
          active: true,
        })
        .returning();
      return res.json(service);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to create service" });
    }
  });

  // GET /api/marketplace/services
  app.get("/api/marketplace/services", async (_req, res) => {
    try {
      const services = await db
        .select()
        .from(writerServices)
        .where(eq(writerServices.active, true));
      return res.json(services);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // POST /api/marketplace/services/:id/book — create PayPal order
  app.post("/api/marketplace/services/:id/book", async (req: any, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const [service] = await db
        .select()
        .from(writerServices)
        .where(eq(writerServices.id, Number(req.params.id)));
      if (!service) return res.status(404).json({ error: "Service not found" });

      const token = await getPayPalAccessToken();
      const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "GBP",
                value: Number(service.priceGbp).toFixed(2),
              },
              description: service.title,
            },
          ],
        }),
      });
      if (!orderRes.ok) {
        const text = await orderRes.text();
        throw new Error(`[PayPal] Order creation failed: ${text}`);
      }
      const order = await orderRes.json();

      const [booking] = await db
        .insert(serviceBookings)
        .values({
          serviceId: service.id,
          clientId: req.user.id,
          paypalOrderId: order.id,
          status: "pending",
          amountGbp: String(service.priceGbp),
        })
        .returning();

      return res.json({ orderId: order.id, bookingId: booking.id, order });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // POST /api/marketplace/services/bookings/:bookingId/capture
  app.post(
    "/api/marketplace/services/bookings/:bookingId/capture",
    async (req: any, res) => {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      try {
        const [booking] = await db
          .select()
          .from(serviceBookings)
          .where(eq(serviceBookings.id, Number(req.params.bookingId)));
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        const token = await getPayPalAccessToken();
        const captureRes = await fetch(
          `${PAYPAL_API}/v2/checkout/orders/${booking.paypalOrderId}/capture`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!captureRes.ok) {
          const text = await captureRes.text();
          throw new Error(`[PayPal] Capture failed: ${text}`);
        }
        const capture = await captureRes.json();

        await db
          .update(serviceBookings)
          .set({ status: "paid" })
          .where(eq(serviceBookings.id, booking.id));

        return res.json({ success: true, capture });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to capture payment" });
      }
    }
  );

  // —— TIP JAR ——————————————————————————————————————————————————
  // GET /api/marketplace/tips/:writerId
  app.get("/api/marketplace/tips/:writerId", async (req, res) => {
    try {
      const [jar] = await db
        .select()
        .from(tipJars)
        .where(eq(tipJars.writerId, Number(req.params.writerId)));
      return res.json(jar || null);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch tip jar" });
    }
  });

  // POST /api/marketplace/tips/:writerId — create PayPal order for tip
  app.post("/api/marketplace/tips/:writerId", async (req: any, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const { amountGbp } = req.body;
      if (!amountGbp || Number(amountGbp) < 0.5) {
        return res.status(400).json({ error: "Minimum tip is £0.50" });
      }

      const token = await getPayPalAccessToken();
      const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "GBP",
                value: Number(amountGbp).toFixed(2),
              },
              description: "Tip for writer",
            },
          ],
        }),
      });
      if (!orderRes.ok) {
        const text = await orderRes.text();
        throw new Error(`[PayPal] Tip order creation failed: ${text}`);
      }
      const order = await orderRes.json();

      const [tx] = await db
        .insert(tipTransactions)
        .values({
          writerId: Number(req.params.writerId),
          tipperId: req.user.id,
          paypalOrderId: order.id,
          amountGbp: String(amountGbp),
          status: "pending",
        })
        .returning();

      return res.json({ orderId: order.id, transactionId: tx.id, order });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to create tip order" });
    }
  });

  // POST /api/marketplace/tips/transactions/:txId/capture
  app.post(
    "/api/marketplace/tips/transactions/:txId/capture",
    async (req: any, res) => {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      try {
        const [tx] = await db
          .select()
          .from(tipTransactions)
          .where(eq(tipTransactions.id, Number(req.params.txId)));
        if (!tx) return res.status(404).json({ error: "Transaction not found" });

        const token = await getPayPalAccessToken();
        const captureRes = await fetch(
          `${PAYPAL_API}/v2/checkout/orders/${tx.paypalOrderId}/capture`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!captureRes.ok) {
          const text = await captureRes.text();
          throw new Error(`[PayPal] Tip capture failed: ${text}`);
        }
        const capture = await captureRes.json();

        await db
          .update(tipTransactions)
          .set({ status: "paid" })
          .where(eq(tipTransactions.id, tx.id));

        return res.json({ success: true, capture });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to capture tip" });
      }
    }
  );
}
