import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, SocialMediaLink } from '../database/models';
import checkJwt from '../middleware/authentication.js';
import userOwnsMerchant from '../middleware/merchantOwner.middleware.js';
import { redisPrefixMerchantOwner } from "../service/redis.service";

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

//Update a social media link for this merchant
router.put("/:id", checkJwt, userOwnsMerchant, async (req, res) => {
    try {
        const { name, displayName, url } = req.body;

        const link = await SocialMediaLink.findOne({
            where: { MerchantId: req.params.merchantId, id: req.params.id }
        });

        if (!link) {
            return res.status(404).json({ message: 'SocialMediaLink not found.' });
        }

        let update = {
            name, displayName, url
        };

        const updatedLink = await SocialMediaLink.update(
        update,
        {
            returning: true,
            where: { id: req.params.id }
        }
        );
    
        if (updatedLink[0] === 0)
            return res.status(404).json({ message: 'The merchant with the given id was not found' });

        return res.status(200).json({SocialMediaLink: updatedLink[1][0].dataValues});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Insert a social media link for this merchant
router.post("/", checkJwt, userOwnsMerchant, async (req, res) => {
    try {
        const { name, displayName, url } = req.body;

        if (!name || name.length == 0 || !displayName || displayName.length == 0 || !url || url.length == 0) {
            return res.status(400).json({ message: 'Must specify name, displayName, and url'});
        }

        const link = await SocialMediaLink.create( {
            name, displayName, url, MerchantId: req.params.merchantId
        });

        if (link) {
            return res.status(201).json({ link });
        }
        return res.status(400).json({ message: 'Must specify name, displayName, and url'});

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Delete a social media link for this merchant
router.delete("/:id", checkJwt, userOwnsMerchant, async (req, res) => {
    try {

        await SocialMediaLink.destroy({
            where: { id: req.params.id }
        });

        return res.status(200).json({ message: 'Social Media Link deleted.'});

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;