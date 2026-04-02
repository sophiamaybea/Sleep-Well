// Full implementation of editorialLetters.ts

import express from 'express';
import { EditorialLetter } from '../models/EditorialLetter';

const router = express.Router();

// Get all editorial letters
router.get('/', async (req, res) => {
    try {
        const letters = await EditorialLetter.find();
        res.status(200).json(letters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new editorial letter
router.post('/', async (req, res) => {
    const letter = new EditorialLetter(req.body);
    try {
        const savedLetter = await letter.save();
        res.status(201).json(savedLetter);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update an editorial letter
router.put('/:id', async (req, res) => {
    try {
        const updatedLetter = await EditorialLetter.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedLetter);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an editorial letter
router.delete('/:id', async (req, res) => {
    try {
        await EditorialLetter.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
