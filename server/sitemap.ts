import { type Express, type Request, type Response } from "express";
import { pool } from "./db";

const ORIGIN = "https://www.thepagegalleryjournal.com";

const STATIC_ROUTES = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/in-bloom", priority: "0.9", changefreq: "daily" },
  { loc: "/about", priority: "0.7", changefreq: "monthly" },
  { loc: "/how-it-works", priority: "0.6", changefreq: "monthly" },
  { loc: "/garden-info", priority: "0.6", changefreq: "monthly" },
  { loc: "/for-journals", priority: "0.5", changefreq: "monthly" },
  { loc: "/commons", priority: "0.5", changefreq: "weekly" },
  { loc: "/submissions", priority: "0.5", changefreq: "monthly" },
  { loc: "/garden-guide", priority: "0.5", changefreq: "monthly" },
  { loc: "/field-guide", priority: "0.5", changefreq: "monthly" },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toW3CDate(date: Date | string | null): string {
  if (!date) return new Date().toISOString().slice(0, 10);
  return new Date(date).toISOString().slice(0, 10);
}

export function registerSitemapRoute(app: Express) {
  app.get("/sitemap.xml", async (_req: Request, res: Response) => {
    try {
      // Fetch all published pieces
      const result = await pool.query<{ id: string; published_at: string | null; updated_at?: string | null }>(
        `SELECT id, published_at, updated_at FROM writings WHERE is_published = true ORDER BY published_at DESC`
      );

      const staticUrls = STATIC_ROUTES.map(
        ({ loc, priority, changefreq }) =>
          `  <url>\n    <loc>${ORIGIN}${escapeXml(loc)}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
      ).join("\n");

      const pieceUrls = result.rows
        .map((row) => {
          const lastmod = toW3CDate(row.updated_at ?? row.published_at);
          return `  <url>\n    <loc>${ORIGIN}/piece/${escapeXml(row.id)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
        })
        .join("\n");

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticUrls}\n${pieceUrls}\n</urlset>`;

      res.set("Content-Type", "text/xml; charset=utf-8");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err) {
      console.error("[sitemap] Failed to generate sitemap:", err);
      res.status(500).send("<?xml version=\"1.0\"?><error>Sitemap unavailable</error>");
    }
  });
}
