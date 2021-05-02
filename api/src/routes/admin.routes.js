import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, MerchantClaim, User } from '../database/models';

const router = Router();

//endpoint to authenticate administrators
router.get("/", async(req, res) => {
    return res.status(200).json({ message: 'Authenticated.'});
})

// Retrieve all Merchant Claims
router.get("/claims", async (req, res) => {
    try {
        const claims = await MerchantClaim.findAll();
        // const tags = await merchant.getTags({through: {attributes: []}});
        return res.status(200).json({ claims });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/claims/:claimId", async (req, res) => {
    try {
        const claim = await MerchantClaim.findOne({
            where: {
                id: req.params.claimId
            },
            include: [
                { model: Merchant },
                { model: User }
            ]
        });
        return res.status(200).json({ claim });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

export default router;