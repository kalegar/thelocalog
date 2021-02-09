import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, Image } from '../database/models';
import { Op } from 'sequelize';

const router = Router({mergeParams: true});

// Retrieve all images for this merchant
router.get("/", async (req, res) => {
    try {
        const { type } = req.query;

        const merchant = await Merchant.findOne({
            where: { id: req.params.merchantId },
            include: {
                model: Image,
                where: {
                    type: {
                        [Op.iLike]: type ? '%'+type+'%' : '%'
                    }
                },
                through: {
                    attributes: []
                }
            }
        });
        return res.status(200).json(merchant.Images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;