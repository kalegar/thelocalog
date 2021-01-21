import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Category } from '../database/models';

const router = Router({mergeParams: true});

// Retrieve all categories
router.get("/", async (req, res) => {
    try {
        const categories = await Category.findAll({
            attributes: ['category'],
            order: [['category','asc']]
        });
        return res.status(200).json({ categories });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;