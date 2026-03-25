import { type Express } from "express";
import { desc } from "drizzle-orm";
import { db } from "../db";
import { serviceInquiries } from "@shared/schema";
import nodemailer from "nodemailer";

export function registerServiceInquiryRoutes(app: Express) {
  // POST /api/services/inquire — public, no auth required
  app.post("/api/services/inquire", async (req: any, res) => {
    try {
      const { name, email, serviceType, message } = req.body;

      if (!name || !email || !serviceType || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      // Save to database
      const [inquiry] = await db
        .insert(serviceInquiries)
        .values({ name, email, serviceType, message })
        .returning();

      // Send email notification if SMTP credentials are configured
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: `"The Page Gallery" <${process.env.SMTP_USER}>`,
                        to: "sophia@pagegalleryjournal.com",
            subject: `🌱 New Service Inquiry: ${serviceType} — ${name}`,
            html: `
              <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2d2d2d;">New Service Inquiry</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Service:</strong> ${serviceType}</p>
                <hr style="border: 1px solid #eee;" />
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
                <hr style="border: 1px solid #eee;" />
                <p style="color: #888; font-size: 12px;">Submitted via The Page Gallery editorial board form.</p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error("Email send failed (non-fatal):", emailErr);
        }
      }

      return res.status(201).json({
        success: true,
        message: "Thank you — your inquiry has been received by the editorial board.",
        id: inquiry.id,
      });
    } catch (error) {
      console.error("Service inquiry error:", error);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });
  
  // GET /api/services/inquiries - EIC only, requires auth
  app.get("/api/services/inquiries", async (req: any, res) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorised" });
      }
      const user = req.user as any;
      if (user.role !== "editor_in_chief" && user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const inquiries = await db
        .select()
        .from(serviceInquiries)
                .orderBy(desc(serviceInquiries.createdAt));
      return res.json(inquiries);
    } catch (error) {
      console.error("Failed to fetch service inquiries:", error);
      return res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });
}
