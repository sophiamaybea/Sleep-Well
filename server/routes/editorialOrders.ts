import { type Express } from "express";
import { db } from "../db";
import { editorialServiceOrders } from "@shared/schema";
import { eq } from "drizzle-orm";

// Price map in GBP pence — single source of truth
// single_piece: £95 | collection: £135 | portfolio: £175
const SCOPE_PRICES: Record<string, number> = {
  single_piece: 9500,
  collection: 13500,
  portfolio: 17500,
};

// Editorial Feedback (Garden) — flat rate £5 / 500p — IMMUTABLE
const EDITORIAL_FEEDBACK_PRICE_PENCE = 500;

const PAYPAL_API =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
          throw new Error('[PayPal] PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set in environment variables. Payment routes will not function without these.');
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
  const data = await res.json();
  return data.access_token;
}

export function registerEditorialOrderRoutes(app: Express) {
  // POST /api/editorial-orders/create-order
  // Validates scope, creates PayPal order, inserts pending row
  app.post("/api/editorial-orders/create-order", async (req, res) => {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return res.status(503).json({ error: "Payment service is not configured. Please try again later." });
    }
    const { name, email, genre, manuscriptType, estimatedWordCount, brief, serviceScope } =
      req.body;

    if (!name || !email || !serviceScope) {
      return res.status(400).json({ error: "name, email and serviceScope are required" });
    }

    const pricePence = SCOPE_PRICES[serviceScope];
    if (!pricePence) {
      return res
        .status(400)
        .json({ error: `Invalid serviceScope. Must be one of: ${Object.keys(SCOPE_PRICES).join(", ")}` });
    }

    try {
      const accessToken = await getPayPalAccessToken();

      const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "GBP",
                value: (pricePence / 100).toFixed(2),
              },
              description: `Editorial letter (${serviceScope.replace("_", " ")}) — The Page Gallery`,
            },
          ],
        }),
      });

      const order = await orderRes.json();

      if (!order.id) {
        console.error("[editorial-orders] PayPal order creation failed:", order);
        return res.status(500).json({ error: "PayPal order creation failed" });
      }

      // Insert a pending row — will be confirmed on capture
      await db.insert(editorialServiceOrders).values({
        name,
        email,
        genre: genre || "poetry",
        manuscriptType: manuscriptType || "poetry_collection",
        estimatedWordCount: estimatedWordCount ? parseInt(estimatedWordCount, 10) : null,
        brief: brief || null,
        serviceScope,
        quotedPricePence: pricePence,
        status: "payment_pending",
        paypalOrderId: order.id,
      });

      res.json({ orderId: order.id, pricePence });
    } catch (err) {
      console.error("[editorial-orders] create-order error:", err);
      res.status(500).json({ error: "Could not create order" });
    }
  });

  // POST /api/editorial-orders/capture-order
  // Captures PayPal payment and marks order as paid
  app.post("/api/editorial-orders/capture-order", async (req, res) => {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return res.status(503).json({ error: "Payment service is not configured. Please try again later." });
    }
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    try {
      const accessToken = await getPayPalAccessToken();

      const captureRes = await fetch(
        `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const capture = await captureRes.json();

      if (capture.status !== "COMPLETED") {
        console.error("[editorial-orders] capture not completed:", capture);
        return res.status(402).json({ error: "Payment not completed", details: capture });
      }

      await db
        .update(editorialServiceOrders)
        .set({
          paymentConfirmed: true,
          status: "paid",
          paidAt: new Date(),
        })
        .where(eq(editorialServiceOrders.paypalOrderId, orderId));

      res.json({ success: true });
    } catch (err) {
      console.error("[editorial-orders] capture-order error:", err);
      res.status(500).json({ error: "Could not capture payment" });
    }
  });

  // GET /api/editorial-orders — editor_in_chief only
  // Returns all orders for the EIC dashboard
  app.get("/api/editorial-orders", async (req: any, res) => {
    if (
      !req.user ||
      (req.user.role !== "editor_in_chief" && req.user.role !== "editor")
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }
    try {
      const orders = await db
        .select()
        .from(editorialServiceOrders)
        .orderBy(editorialServiceOrders.createdAt);
      res.json(orders);
    } catch (err) {
      console.error("[editorial-orders] list error:", err);
      res.status(500).json({ error: "Could not fetch orders" });
    }
  });

  // PATCH /api/editorial-orders/:id — editor_in_chief only
  // Update status, add sophia_note, or deliver the letter
  app.patch("/api/editorial-orders/:id", async (req: any, res) => {
    if (!req.user || req.user.role !== "editor_in_chief") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { status, sophiaNote, editorLetterDraft } = req.body;
    try {
      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      };
      if (status) updateData.status = status;
      if (sophiaNote !== undefined) updateData.sophiaNote = sophiaNote;
      if (editorLetterDraft !== undefined) {
        updateData.editorLetterDraft = editorLetterDraft;
        if (status === "delivered") updateData.deliveredAt = new Date();
      }

      await db
        .update(editorialServiceOrders)
        .set(updateData)
        .where(eq(editorialServiceOrders.id, req.params.id));

      res.json({ success: true });
    } catch (err) {
      console.error("[editorial-orders] patch error:", err);
      res.status(500).json({ error: "Could not update order" });
    }
  });

  // GET /api/editorial-orders/price — public, returns price map for the frontend
  app.get("/api/editorial-orders/price", (_req, res) => {
    res.json(SCOPE_PRICES);
  });

    // POST /api/editorial-orders/feedback-order
  // Garden-specific: flat £5 / 500p editorial feedback via Stripe Checkout
  app.post("/api/editorial-orders/feedback-order", async (req: any, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const { writingId, writingTitle } = req.body;
    if (!writingId) return res.status(400).json({ error: "writingId required" });
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return res.json({
        mode: "confirm",
        pricePence: EDITORIAL_FEEDBACK_PRICE_PENCE,
        message: "Editorial feedback: £5. Stripe not yet configured.",
      });
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Stripe = require("stripe");
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-01-27.acacia" });
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "gbp",
            unit_amount: EDITORIAL_FEEDBACK_PRICE_PENCE,
            product_data: {
              name: "Editorial Feedback — The Page Gallery",
              description: writingTitle ? `Read: "${String(writingTitle).slice(0, 80)}"` : "Editorial read (5-day turnaround)",
            },
          },
          quantity: 1,
        }],
        metadata: { writingId: String(writingId), userId: String(req.user.id), type: "editorial_feedback" },
        success_url: `${process.env.PUBLIC_URL || "https://sleep-well-production.up.railway.app"}/garden?feedback_success=1`,
        cancel_url: `${process.env.PUBLIC_URL || "https://sleep-well-production.up.railway.app"}/garden?feedback_cancelled=1`,
      });
      await db.insert(editorialServiceOrders).values({
                  name: req.user!.displayName || req.user!.email || "Writer",
        email: req.user.email || "",
        genre: "garden",
        manuscriptType: "single_piece",
        estimatedWordCount: null,
        brief: writingTitle ? `Garden: ${String(writingTitle)}` : null,
        serviceScope: "editorial_feedback",
        quotedPricePence: EDITORIAL_FEEDBACK_PRICE_PENCE,
        status: "payment_pending",
        paypalOrderId: session.id,
      });
      res.json({ url: session.url, pricePence: EDITORIAL_FEEDBACK_PRICE_PENCE });
    } catch (err) {
      console.error("[editorial-orders] feedback-order error:", err);
      res.status(500).json({ error: "Could not create checkout session" });
    }
  });
}
