import { Router } from "express";
import { db } from "../db";
import { eq, and, desc, count, inArray } from "drizzle-orm";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });
  next();
};

router.get("/weaves", requireAuth, async (req: any, res) => {
  try {
    const { poemWeaves, weaveInvitations } = await import("../../shared/schema");
    const userId = req.user.id;

    const invitedWeaveRows = await db
      .select({ weaveId: weaveInvitations.weaveId })
      .from(weaveInvitations)
      .where(eq(weaveInvitations.userId, userId));

    const invitedWeaveIds = invitedWeaveRows.map((r: any) => r.weaveId);

    const myWeaves = await db
      .select()
      .from(poemWeaves)
      .where(eq(poemWeaves.initiatorId, userId));

    const invitedWeaves = invitedWeaveIds.length
      ? await db
          .select()
          .from(poemWeaves)
          .where(and(eq(poemWeaves.status, "open"), inArray(poemWeaves.id, invitedWeaveIds)))
      : [];

    const rows = [...myWeaves, ...invitedWeaves];

    return res.json(rows);
  } catch (error) {
    console.error("[poemWeaving:get /weaves]", error);
    return res.status(500).json({ error: "Failed to fetch weaves" });
  }
});

router.get("/weaves/national-poetry-day", async (_req, res) => {
  try {
    const { poemWeaves } = await import("../../shared/schema");
    const rows = await db
      .select()
      .from(poemWeaves)
      .where(and(eq(poemWeaves.isNationalPoetryDay, true), eq(poemWeaves.status, "open")))
      .orderBy(desc(poemWeaves.createdAt));
    return res.json(rows);
  } catch (error) {
    console.error("[poemWeaving:get /weaves/national-poetry-day]", error);
    return res.status(500).json({ error: "Failed to fetch NPD weaves" });
  }
});

router.get("/weaves/:id", requireAuth, async (req: any, res) => {
  try {
    const { poemWeaves, weaveStanzas, weaveInvitations } = await import("../../shared/schema");
    const userId = req.user.id;

    const [weave] = await db
      .select()
      .from(poemWeaves)
      .where(eq(poemWeaves.id, req.params.id));

    if (!weave) return res.status(404).json({ error: "Weave not found" });

    const isInitiator = weave.initiatorId === userId;
    if (!isInitiator) {
      const [invite] = await db
        .select()
        .from(weaveInvitations)
        .where(and(eq(weaveInvitations.weaveId, weave.id), eq(weaveInvitations.userId, userId)));
      if (!invite) return res.status(403).json({ error: "Not invited to this weave" });
    }

    const stanzas = await db
      .select()
      .from(weaveStanzas)
      .where(eq(weaveStanzas.weaveId, weave.id))
      .orderBy(weaveStanzas.turnOrder);

    const invitations = await db
      .select()
      .from(weaveInvitations)
      .where(eq(weaveInvitations.weaveId, weave.id));

    return res.json({ weave, stanzas, invitations });
  } catch (error) {
    console.error("[poemWeaving:get /weaves/:id]", error);
    return res.status(500).json({ error: "Failed to fetch weave" });
  }
});

router.post("/weaves", requireAuth, async (req: any, res) => {
  try {
    const {
      title,
      prompt,
      circleId,
      form,
      maxContributors,
      maxStanzasPerContributor,
      isNationalPoetryDay,
    } = req.body;

    if (!title) return res.status(400).json({ error: "title required" });

    if (isNationalPoetryDay && req.user.role !== "editor") {
      return res.status(403).json({ error: "Only editors can create National Poetry Day weaves" });
    }

    const { poemWeaves, weaveInvitations } = await import("../../shared/schema");

    const [weave] = await db
      .insert(poemWeaves)
      .values({
        title,
        prompt: prompt ?? "",
        initiatorId: req.user.id,
        circleId: circleId ?? null,
        form: form ?? "free",
        maxContributors: maxContributors ?? 6,
        maxStanzasPerContributor: maxStanzasPerContributor ?? 3,
        status: "open",
        isNationalPoetryDay: isNationalPoetryDay ?? false,
      })
      .returning();

    await db.insert(weaveInvitations).values({
      weaveId: weave.id,
      userId: req.user.id,
      status: "accepted",
    });

    return res.status(201).json(weave);
  } catch (error) {
    console.error("[poemWeaving:post /weaves]", error);
    return res.status(500).json({ error: "Failed to create weave" });
  }
});

router.post("/weaves/:id/stanzas", requireAuth, async (req: any, res) => {
  try {
    const { weaveStanzas, poemWeaves, weaveInvitations, notifications } = await import("../../shared/schema");
    const userId = req.user.id;
    const weaveId = req.params.id;
    const { content } = req.body;

    if (!content?.trim()) return res.status(400).json({ error: "content required" });

    const [weave] = await db.select().from(poemWeaves).where(eq(poemWeaves.id, weaveId));
    if (!weave) return res.status(404).json({ error: "Weave not found" });
    if (weave.status !== "open") return res.status(400).json({ error: "Weave is closed" });

    const [invite] = await db
      .select()
      .from(weaveInvitations)
      .where(and(eq(weaveInvitations.weaveId, weaveId), eq(weaveInvitations.userId, userId)));

    if (!invite || invite.status === "declined") {
      return res.status(403).json({ error: "Not invited to this weave" });
    }

    const [{ total }] = await db
      .select({ total: count() })
      .from(weaveStanzas)
      .where(and(eq(weaveStanzas.weaveId, weaveId), eq(weaveStanzas.authorId, userId)));

    if (Number(total) >= weave.maxStanzasPerContributor) {
      return res.status(400).json({ error: "You have contributed your maximum stanzas to this weave" });
    }

    const [{ nextTurn }] = await db
      .select({ nextTurn: count() })
      .from(weaveStanzas)
      .where(eq(weaveStanzas.weaveId, weaveId));

    const [stanza] = await db
      .insert(weaveStanzas)
      .values({
        weaveId,
        authorId: userId,
        content,
        turnOrder: Number(nextTurn) + 1,
      })
      .returning();

    if (weave.initiatorId !== userId) {
      await db.insert(notifications).values({
        userId: weave.initiatorId,
        type: "weave_stanza_added",
        actorId: userId,
        message: `A new stanza was added to your weave "${weave.title}"`,
      });
    }

    return res.status(201).json(stanza);
  } catch (error) {
    console.error("[poemWeaving:post /weaves/:id/stanzas]", error);
    return res.status(500).json({ error: "Failed to add stanza" });
  }
});

router.post("/weaves/:id/invite", requireAuth, async (req: any, res) => {
  try {
    const { poemWeaves, weaveInvitations, notifications } = await import("../../shared/schema");
    const userId = req.user.id;
    const weaveId = req.params.id;
    const { inviteeId } = req.body;

    const [weave] = await db.select().from(poemWeaves).where(eq(poemWeaves.id, weaveId));
    if (!weave) return res.status(404).json({ error: "Weave not found" });
    if (weave.initiatorId !== userId) return res.status(403).json({ error: "Only the initiator can invite" });

    const [existing] = await db
      .select()
      .from(weaveInvitations)
      .where(and(eq(weaveInvitations.weaveId, weaveId), eq(weaveInvitations.userId, inviteeId)));
    if (existing) return res.status(400).json({ error: "Already invited" });

    const [invitation] = await db
      .insert(weaveInvitations)
      .values({ weaveId, userId: inviteeId, status: "pending" })
      .returning();

    await db.insert(notifications).values({
      userId: inviteeId,
      type: "weave_invitation",
      actorId: userId,
      message: `You've been invited to collaborate on "${weave.title}"`,
    });

    return res.status(201).json(invitation);
  } catch (error) {
    console.error("[poemWeaving:post /weaves/:id/invite]", error);
    return res.status(500).json({ error: "Failed to send invitation" });
  }
});

router.patch("/weave-invitations/:id", requireAuth, async (req: any, res) => {
  try {
    const { weaveInvitations } = await import("../../shared/schema");
    const { status } = req.body;
    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ error: "status must be accepted or declined" });
    }

    const [row] = await db
      .update(weaveInvitations)
      .set({ status })
      .where(and(eq(weaveInvitations.id, req.params.id), eq(weaveInvitations.userId, req.user.id)))
      .returning();

    if (!row) return res.status(404).json({ error: "Invitation not found" });
    return res.json(row);
  } catch (error) {
    console.error("[poemWeaving:patch /weave-invitations/:id]", error);
    return res.status(500).json({ error: "Failed to update invitation" });
  }
});

router.patch("/weaves/:id/close", requireAuth, async (req: any, res) => {
  try {
    const { poemWeaves } = await import("../../shared/schema");
    const userId = req.user.id;

    const [weave] = await db.select().from(poemWeaves).where(eq(poemWeaves.id, req.params.id));
    if (!weave) return res.status(404).json({ error: "Not found" });

    const canClose = weave.initiatorId === userId || req.user.role === "editor";
    if (!canClose) return res.status(403).json({ error: "Forbidden" });

    const [updated] = await db
      .update(poemWeaves)
      .set({ status: "closed", updatedAt: new Date() })
      .where(eq(poemWeaves.id, req.params.id))
      .returning();

    return res.json(updated);
  } catch (error) {
    console.error("[poemWeaving:patch /weaves/:id/close]", error);
    return res.status(500).json({ error: "Failed to close weave" });
  }
});

router.post("/weaves/:id/harvest", requireAuth, async (req: any, res) => {
  try {
    const { poemWeaves, weaveStanzas, writings } = await import("../../shared/schema");
    const userId = req.user.id;

    const [weave] = await db.select().from(poemWeaves).where(eq(poemWeaves.id, req.params.id));
    if (!weave) return res.status(404).json({ error: "Not found" });

    const canHarvest = weave.initiatorId === userId || req.user.role === "editor";
    if (!canHarvest) return res.status(403).json({ error: "Forbidden" });

    const stanzas = await db
      .select()
      .from(weaveStanzas)
      .where(eq(weaveStanzas.weaveId, weave.id))
      .orderBy(weaveStanzas.turnOrder);

    const combinedContent = stanzas.map((s: any) => s.content).join("\n\n");
    const { visibility } = req.body;

    const [writing] = await db
      .insert(writings)
      .values({
        authorId: userId,
        title: weave.title,
        content: combinedContent,
        stage: "sprout",
        genre: "poetry",
        visibility: visibility ?? "circle",
        readiness: "growing",
        tags: ["collaborative", "weave"],
      })
      .returning();

    await db
      .update(poemWeaves)
      .set({ writingId: writing.id, status: "published", updatedAt: new Date() })
      .where(eq(poemWeaves.id, weave.id));

    return res.status(201).json({ writing, weave: { ...weave, writingId: writing.id } });
  } catch (error) {
    console.error("[poemWeaving:post /weaves/:id/harvest]", error);
    return res.status(500).json({ error: "Failed to harvest weave" });
  }
});

export function registerPoemWeavingRoutes(app: any) {
  app.use("/api", router);
}
