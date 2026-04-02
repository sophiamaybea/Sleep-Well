import { Router } from 'express';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';

const router = Router();

router.get('/api/collections/public/:username/:slug', async (req: any, res: any) => {
  const { username, slug } = req.params;
  try {
    const { chapbookCollections, users } = await import('@shared/schema');
    // Find user by username
    const user = await db.query.users.findFirst({
      where: (u: any, { eq: eqOp }: any) => eqOp(u.username, username),
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find collection by shareSlug and authorId
    const collection = await db.query.chapbookCollections.findFirst({
      where: (c: any, { eq: eqOp, and: andOp }: any) =>
        andOp(eqOp(c.authorId, user.id), eqOp(c.shareSlug, slug)),
    });
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    if (!collection.isPublic) return res.status(403).json({ error: 'Collection is private' });

    res.status(200).json(collection);
  } catch (error: any) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
