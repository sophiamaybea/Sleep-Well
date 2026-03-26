import { type Express } from "express";
import { db } from "../db";
import { rejectionFeedbackRequests } from "@shared/schema";
import { eq } from "drizzle-orm";

const FEEDBACK_PRICE_PENCE = 1500; // £15
const PAYPAL_API =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
          throw new Error('[PayPal] PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set in environment variables.');
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

export function registerGalleryFeedbackRoutes(app: Express) {
  // POST /api/gallery-feedback/create-order
  // Creates a PayPal order and a pending feedback request row
  app.post("/api/gallery-feedback/create-order", async (req: any, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorised" });
    const { writingId } = req.body;
    if (!writingId) return res.status(400).json({ error: "writingId required" });

    try {
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
                value: (FEEDBACK_PRICE_PENCE / 100).toFixed(2),
              },
              description: "One page of editorial feedback — The Page Gallery",
            },
          ],
        }),
      });
      const order = await orderRes.json();

      await db.insert(rejectionFeedbackRequests).values({
        writingId,
        authorId: req.user.id,
        flagId: null as any,
        tier: "paid",
        status: "requested",
        paidAmountPence: FEEDBACK_PRICE_PENCE,
        paypalOrderId: order.id,
      });

      res.json({ orderId: order.id });
    } catch (err) {
      console.error("[gallery-feedback] create-order error:", err);
      res.status(500).json({ error: "Could not create PayPal order" });
    }
  });

  // POST /api/gallery-feedback/capture-order
  // Captures the PayPal payment and marks the feedback request as payment confirmed
  app.post("/api/gallery-feedback/capture-order", async (req: any, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorised" });
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    try {
      const token = await getPayPalAccessToken();
      const captureRes = await fetch(
        `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const capture = await captureRes.json();
      if (capture.status !== "COMPLETED") {
        return res.status(402).json({ error: "Payment not completed", capture });
      }

      await db
        .update(rejectionFeedbackRequests)
        .set({ paymentConfirmed: true, status: "requested" })
        .where(eq(rejectionFeedbackRequests.paypalOrderId, orderId));

      res.json({ success: true });
    } catch (err) {
      console.error("[gallery-feedback] capture-order error:", err);
      res.status(500).json({ error: "Could not capture PayPal order" });
    }
  });

  // GET /api/gallery-feedback/:writingId
  // Returns feedback request status for a writing (own rows only)
  app.get("/api/gallery-feedback/:writingId", async (req: any, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorised" });
    try {
      const rows = await db
        .select()
        .from(rejectionFeedbackRequests)
        .where(eq(rejectionFeedbackRequests.writingId, req.params.writingId));
      const mine = rows.filter((r) => r.authorId === req.user.id);
      res.json(mine);
    } catch (err) {
      console.error("[gallery-feedback] get status error:", err);
      res.status(500).json({ error: "Could not fetch feedback status" });
    }
  });
}
