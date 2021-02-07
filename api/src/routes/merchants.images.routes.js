import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant } from '../database/models';

const router = Router({mergeParams: true});

// Retrieve all images for this merchant
router.get("/", async (req, res) => {
    try {
        const merchant = await Merchant.findOne({
            where: { id: req.params.merchantId }
        });
        const images = await merchant.getImages();
        return res.status(200).json({ images });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;