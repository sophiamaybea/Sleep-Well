import { type Request, type Response } from "express";
import { db } from "../db";
import { takeoverScreens, insertTakeoverScreenSchema, updateTakeoverScreenSchema } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export function registerTakeoverScreenRoutes(app: any) {
  // Get all takeover screens
  app.get("/api/takeover-screens", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const screens = await db
        .select()
        .from(takeoverScreens)
        .orderBy(desc(takeoverScreens.displayDuration));
      
      return res.json(screens);
    } catch (error: any) {
      console.error("Error fetching takeover screens:", error);
      return res.status(500).send("Failed to fetch takeover screens");
    }
  });

  // Get single takeover screen
  app.get("/api/takeover-screens/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const screen = await db
        .select()
        .from(takeoverScreens)
        .where(eq(takeoverScreens.id, req.params.id))
        .limit(1);
      
      if (!screen.length) {
        return res.status(404).send("Takeover screen not found");
      }
      
      return res.json(screen[0]);
    } catch (error: any) {
      console.error("Error fetching takeover screen:", error);
      return res.status(500).send("Failed to fetch takeover screen");
    }
  });

  // Create takeover screen (editor only)
  app.post("/api/takeover-screens", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).send("Not authenticated");
    }

    if (req.user.role !== "editor" && req.user.role !== "editor_in_chief") {
      return res.status(403).send("Only editors can create takeover screens");
    }

    try {
      const validatedData = insertTakeoverScreenSchema.parse(req.body);
      const newScreen = await db
        .insert(takeoverScreens)
        .values({
          ...validatedData,
          createdById: req.user.id,
        })
        .returning();
      
      return res.json(newScreen[0]);
    } catch (error: any) {
      console.error("Error creating takeover screen:", error);
      return res.status(500).send("Failed to create takeover screen");
    }
  });

  // Update takeover screen (editor only)
  app.patch("/api/takeover-screens/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).send("Not authenticated");
    }

    if (req.user.role !== "editor" && req.user.role !== "editor_in_chief") {
      return res.status(403).send("Only editors can update takeover screens");
    }

    try {
      const validatedData = updateTakeoverScreenSchema.parse(req.body);
      const updatedScreen = await db
        .update(takeoverScreens)
        .set(validatedData)
        .where(eq(takeoverScreens.id, req.params.id))
        .returning();
      
      if (!updatedScreen.length) {
        return res.status(404).send("Takeover screen not found");
      }
      
      return res.json(updatedScreen[0]);
    } catch (error: any) {
      console.error("Error updating takeover screen:", error);
      return res.status(500).send("Failed to update takeover screen");
    }
  });

  // Delete takeover screen (editor only)
  app.delete("/api/takeover-screens/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).send("Not authenticated");
    }

    if (req.user.role !== "editor" && req.user.role !== "editor_in_chief") {
      return res.status(403).send("Only editors can delete takeover screens");
    }

    try {
      const deleted = await db
        .delete(takeoverScreens)
        .where(eq(takeoverScreens.id, req.params.id))
        .returning();
      
      if (!deleted.length) {
        return res.status(404).send("Takeover screen not found");
      }
      
      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting takeover screen:", error);
      return res.status(500).send("Failed to delete takeover screen");
    }
  });
}
