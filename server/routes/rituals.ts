// Writing Ritual Timer 2.0 server routes

import express from 'express';

const router = express.Router();

// Define the routes for the Ritual Timer
router.get('/rituals', (req, res) => {
    res.json({ message: 'Rituals fetched successfully!' });
});

export default router;
