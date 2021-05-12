import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, MerchantClaim, User } from '../database/models';
import jwtAuthz from 'express-jwt-authz';

const router = Router({mergeParams: true});

// Create a new Merchant Claim
router.post("/", async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
        const { email, text } = req.body;
        const userId = req.user.sub;
  
        const merchant = await Merchant.findOne({
            where: {id : merchantId }
        });
        const user = await User.findOne({
            where: {id : userId}
        });
        if (!merchant) {
            return res.status(404).json({message: `Merchant with id ${merchantId} not found.`});
        }
        if (!user) {
            return res.status(404).json({message: `User with id ${userId} not found.`});
        }
        const merchantClaim = await MerchantClaim.create({
            text,
            email,
            MerchantId : merchant.id,
            UserId: user.id
        });

        return res.status(201).json({ merchantClaim });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Retrieve all Merchant Claims
const viewClaimsScope = jwtAuthz([ 'view:merchant-claims' ]);
router.get("/", viewClaimsScope, async (req, res) => {
    try {
        const merchant = await Merchant.findOne({
            where: { id: req.params.merchantId }
        });
        const claims = await merchant.getClaims();
        // const tags = await merchant.getTags({through: {attributes: []}});
        return res.status(200).json({ claims });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;