import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { db } from "./db";
import { writings, users } from "../shared/schema";
import { eq } from "drizzle-orm";

const BASE_URL = process.env.BASE_URL || "https://www.thepagegalleryjournal.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

function injectMetaTags(
  html: string,
  meta: {
    title?: string;
    description?: string;
    url?: string;
    image?: string;
    twitterCard?: string;
  }
): string {
  const title = meta.title || "The Page Gallery Journal";
  const description =
    meta.description ||
    "A literary journal and writers\u2019 garden for pre-published and independent voices.";
  const url = meta.url || BASE_URL + "/";
  const image = meta.image || DEFAULT_OG_IMAGE;
  const twitterCard = meta.twitterCard || "summary_large_image";

  const injected = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="The Page Gallery Journal" />
    <meta name="twitter:card" content="${twitterCard}" />
    <meta name="twitter:site" content="@pagegalleryjournal" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />`;

  // Remove any existing title / meta og / meta twitter / canonical tags before injecting
  let cleaned = html
    .replace(/<title>[^<]*<\/title>/gi, "")
    .replace(/<meta name="description"[^>]*>/gi, "")
    .replace(/<link rel="canonical"[^>]*>/gi, "")
    .replace(/<meta property="og:[^"]*"[^>]*>/gi, "")
    .replace(/<meta name="twitter:[^"]*"[^>]*>/gi, "");

  return cleaned.replace("</head>", `${injected}\n  </head>`);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // Serve static assets (but not the catch-all — that comes later)
  app.use(express.static(distPath, { index: false }));

  // ── SSR meta injection: individual piece pages ──────────────────────────
  app.get("/piece/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [piece] = await db
        .select({
          id: writings.id,
          title: writings.title,
          content: writings.content,
          authorId: writings.authorId,
        })
        .from(writings)
        .where(eq(writings.id, id))
        .limit(1);

      const indexPath = path.resolve(distPath, "index.html");
      let html = fs.readFileSync(indexPath, "utf-8");

      if (piece) {
        const excerpt = piece.content
          ? piece.content.replace(/<[^>]+>/g, "").slice(0, 157) + "..."
          : `A piece published on The Page Gallery Journal.`;
        html = injectMetaTags(html, {
          title: `${piece.title} | The Page Gallery`,
          description: excerpt,
          url: `${BASE_URL}/piece/${id}`,
        });
      }

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (err) {
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });

  // ── SSR meta injection: writer profile pages ────────────────────────────
  app.get("/writer/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [writer] = await db
        .select({
          id: users.id,
          displayName: users.displayName,
          bio: users.bio,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      const indexPath = path.resolve(distPath, "index.html");
      let html = fs.readFileSync(indexPath, "utf-8");

      if (writer) {
        const displayName = writer.displayName || "Writer";
        const bio =
          writer.bio ||
          `Published works by ${displayName} on The Page Gallery Journal.`;
        html = injectMetaTags(html, {
          title: `${displayName} | The Page Gallery`,
          description: bio.length > 160 ? bio.slice(0, 157) + "..." : bio,
          url: `${BASE_URL}/writer/${id}`,
        });
      }

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (err) {
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });

  // ── SSR meta injection: static named routes ─────────────────────────────
  const staticRoutes: Record<string, { title: string; description: string }> = {
    "/": {
      title: "The Page Gallery Journal",
      description:
        "A literary journal and writers\u2019 garden for pre-published and independent voices. Poetry, prose, and the art of the creative life.",
    },
    "/garden": {
      title: "The Garden | The Page Gallery",
      description:
        "Your private writing space. Tend your seeds, grow your drafts, and share when you\u2019re ready.",
    },
    "/gallery": {
      title: "The Gallery | The Page Gallery",
      description:
        "Published literary works from writers in The Page Gallery community.",
    },
    "/commons": {
      title: "The Commons | The Page Gallery",
      description:
        "The communal space where writers gather, share, and tend each other\u2019s work.",
    },
    "/studio": {
      title: "The Writers\u2019 Studio | The Page Gallery",
      description:
        "Prompt packs, craft tools, and seasonal writing kits. Tools for your private practice.",
    },
    "/in-bloom": {
      title: "In Bloom | The Page Gallery",
      description:
        "Featured writing from The Page Gallery community \u2014 work that has blossomed.",
    },
    "/essays": {
      title: "Essays | The Page Gallery",
      description:
        "Craft essays and reflections on the writing life from The Page Gallery.",
    },
    "/illustration": {
      title: "Illustration | The Page Gallery",
      description:
        "Original illustrations from The Page Gallery\u2019s hand-drawn archive.",
    },
    "/submit": {
      title: "Submit | The Page Gallery",
      description:
        "Submit your writing to The Page Gallery Journal. We welcome poetry, flash fiction, and lyric essays.",
    },
  };

  for (const [routePath, meta] of Object.entries(staticRoutes)) {
    app.get(routePath, (_req, res) => {
      try {
        const indexPath = path.resolve(distPath, "index.html");
        let html = fs.readFileSync(indexPath, "utf-8");
        html = injectMetaTags(html, {
          ...meta,
          url: `${BASE_URL}${routePath === "/" ? "/" : routePath}`,
        });
        res.setHeader("Content-Type", "text/html");
        res.send(html);
      } catch (err) {
        res.sendFile(path.resolve(distPath, "index.html"));
      }
    });
  }

  // ── Catch-all: serve index.html for all other React routes ───────────────
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
