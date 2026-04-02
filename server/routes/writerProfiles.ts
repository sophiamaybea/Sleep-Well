import { Router } from "express";
import { db } from "../db";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { users } from "../../shared/models/auth";
import { writings, writerBios, rootInfluences, readingShelfEntries, tending } from "../../shared/schema";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// GET /api/writers - list all writers with a public profile
router.get("/", async (req: any, res: any) => {
  try {
    const results = await db.query.users.findMany({
      columns: { id: true, displayName: true, firstName: true, lastName: true, profileImageUrl: true, bio: true },
    });
    res.json(results);
  } catch (error: any) {
    console.error("Error fetching writers:", error);
    res.status(500).json({ error: "Failed to fetch writers" });
  }
});

// GET /api/writers/:slug - fetch writer profile by id
router.get("/:slug", async (req: any, res: any) => {
  try {
    const { slug } = req.params;
    const user = await db.query.users.findFirst({
      where: (u: any) => eq(u.id, slug),
    });
    if (!user) return res.status(404).json({ error: "Writer not found" });

    const bio = await db.query.writerBios.findFirst({
      where: (b: any) => eq(b.userId, user.id),
    });

    const publicWritings = await db.query.writings.findMany({
      where: (w: any) => and(eq(w.authorId, user.id), or(eq(w.galleryOptIn, true), eq(w.isPublished, true))),
      orderBy: (w: any) => [desc(w.createdAt)],
    });

    const influences = await db.query.rootInfluences.findMany({
      where: (r: any) => eq(r.userId, user.id),
    });

    const shelf = await db.query.readingShelfEntries.findMany({
      where: (s: any) => eq(s.userId, user.id),
    });

    const tendingCount = await db.select({ count: sql`count(*)` })
      .from(tending)
      .where(eq(tending.gardenerId, user.id));

    res.json({
      user: { id: user.id, displayName: user.displayName, firstName: user.firstName, lastName: user.lastName, profileImageUrl: user.profileImageUrl, bio: user.bio },
      writerBio: bio || null,
      writings: publicWritings,
      rootInfluences: influences,
      readingShelf: shelf,
      tendingCount: Number(tendingCount[0]?.count || 0),
    });
  } catch (error: any) {
    console.error("Error fetching writer profile:", error);
    res.status(500).json({ error: "Failed to fetch writer profile" });
  }
});

export default router;
