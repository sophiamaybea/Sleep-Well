import { Router } from 'express';
import { db } from '../db'; // Assuming you have a db setup with Drizzle
import { chapbookCollections, users, writings } from '../models'; // Import your models

const router = Router();

router.get('/api/collections/public/:username/:slug', async (req, res) => {
    const { username, slug } = req.params;
    try {
        const collection = await db.select(chapbookCollections)
            .innerJoin(users, { 'chapbookCollections.userId': 'users.id' })
            .where('users.username', '=', username)
            .where('chapbookCollections.shareSlug', '=', slug)
            .execute();

        // Assuming collection returns what you need; mapping to return desired fields
        const collectionDetails = collection.map(col => ({
            title: col.title,
            description: col.description,
            price: col.price,
            writings: col.writings.map(writing => ({
                title: writing.title,
                excerpt: writing.excerpt
            }))
        }));

        res.status(200).json(collectionDetails);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;