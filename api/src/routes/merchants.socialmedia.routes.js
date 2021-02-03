import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant } from '../database/models';

const router = Router({mergeParams: true});

// Retrieve all social media links for this merchant
router.get("/", async (req, res) => {
    try {
        const merchant = await Merchant.findOne({
            where: { id: req.params.merchantId }
        });
        const socialmedialinks = await merchant.getSocialMediaLinks();
        return res.status(200).json({ socialmedialinks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;