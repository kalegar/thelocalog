import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, Tag } from '../database/models';

const router = Router({mergeParams: true});

// Create a new Merchant Tag
router.post("/", async (req, res) => {
    try {
        const { tag } = req.body;
        const merchantId = req.params.merchantId;

        if (!tag) {
            return res.status(400).json({ message: 'Must specifiy "tag"' });
        }
  
        const merchant = await Merchant.findOne({
            where: {id : req.params.merchantId }
        });
        const findTag = await Tag.findOrCreate({
            where: { tag: tag.toUpperCase() },
            defaults: { tag: tag }
        });
        const newTag = findTag[0];
        newTag.addMerchant(merchant).then(() => {
            return res.status(201).json({ newTag });
        }).catch((error) => {
            return res.status(500).json({ message: error });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Retrieve all Tags
router.get("/", async (req, res) => {
    try {
        const merchant = await Merchant.findOne({
            where: { id: req.params.merchantId }
        });
        const tags = await merchant.getTags({through: {attributes: []}});
        return res.status(200).json({ tags });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;