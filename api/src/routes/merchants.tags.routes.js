import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, Tag } from '../database/models';
import { QueryTypes } from 'sequelize';
import checkJwt from '../middleware/authentication.js';
import userOwnsMerchant from '../middleware/merchantOwner.middleware.js';

const router = Router({mergeParams: true});

// Create a new Merchant Tag
router.post("/", checkJwt, userOwnsMerchant, async (req, res) => {
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

//Set the tags for this merchant. Will delete all existing tags on the merchant first, then upsert the supplied tags.
router.put("/bulk", checkJwt, userOwnsMerchant, async (req, res) => {
    try {

        const merchant = await Merchant.findOne({
            where: {id : req.params.merchantId }
        });

        if (!merchant) {
            return res.status(404).json({ message: 'Merchant not found.' });
        }

        const { tags } = req.body;
        let tagArray = [];
        if (Array.isArray(tags)) {
            tagArray = tags;
        }else{
            tagArray = [tags];
        }

        const sql = `DELETE FROM "MerchantTags" WHERE "MerchantId" = :merchantId`;
        Merchant.sequelize.query(sql, { type: QueryTypes.DELETE, raw: true, replacements: { merchantId: req.params.merchantId }}).then(
            () => {
                for (const tag of tagArray) {
                    merchant.createTag({ tag: tag }).catch(() => {
                        Tag.findOne({ where: { tag: tag.toUpperCase() }}).then((existingTag) => merchant.addTag(existingTag));
                    })
                }
            }
        )

        res.status(202).json({ message: `Inserted/Updated ${tagArray.length} tags.`});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Retrieve all Tags
router.get("/", async (req, res) => {
    try {
        const merchant = await Merchant.findOne({
            where: { id: req.params.merchantId },
            include: {
                model: Tag,
                through: {
                    attributes: []
                }
            }
        });
        const tags = merchant.Tags;
        return res.status(200).json({ tags });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;