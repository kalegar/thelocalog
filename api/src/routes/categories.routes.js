import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Category, Merchant } from '../database/models';
import { redisClient, redisPrefixCategory, redisExpiryTimeDay } from '../service/redis.service.js';

const router = Router({mergeParams: true});

// Retrieve all categories
router.get("/", async (req, res) => {
    try {
        redisClient.get(redisPrefixCategory + 'ALL', async (err, reply) => {
            if (reply) {
                const data = JSON.parse(reply);
                res.set('Cache-Control', `public, max-age=${redisExpiryTimeDay}`);
                return res.status(200).json({ categories: data});
            }
            const categories = await Category.findAll({
                attributes: ['category'],
                order: [['category','asc']],
                include: {
                    model: Merchant,
                    required: true,
                    attributes: [],
                    through: {attributes: []}
                }
            });
            redisClient.setex(redisPrefixCategory + 'ALL',redisExpiryTimeDay, JSON.stringify(categories));
            res.set('Cache-Control', `public, max-age=${redisExpiryTimeDay}`);
            return res.status(200).json({ categories });
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;