import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Address, Merchant } from '../database/models';
import { redisClient, redisPrefixNeighbourhood, redisExpiryTimeDay } from '../service/redis.service.js';
import { Op } from 'sequelize';

const router = Router({mergeParams: true});

// Retrieve all neighbourhoods
router.get("/neighbourhoods", async (req, res) => {
    try {
        redisClient.get(redisPrefixNeighbourhood + 'ALL', async (err, reply) => {
            if (reply) {
                const data = JSON.parse(reply);
                res.set('Cache-Control', `public, max-age=${redisExpiryTimeDay}`);
                return res.status(200).json({ neighbourhoods: data, cache: true});
            }
            const results = await Address.findAll({
                attributes: ['neighbourhood'],
                order: [['neighbourhood','asc']],
                include: {
                    model: Merchant,
                    required: true,
                    attributes: [],
                    through: {attributes: []},
                    where: {
                        deletedAt: {
                            [Op.is]: null
                        }
                    }
                },
                where: {
                    neighbourhood: {
                        [Op.ne]: ""
                    }
                }
            });
            let neighbourhoods = [];
            for (const neighbourhood of results) {
                neighbourhood.neighbourhood.split(',').map((n) => n.trim()).forEach((n) => {if (!neighbourhoods.includes(n)) neighbourhoods.push(n)});
            }
            neighbourhoods.sort();
            redisClient.setex(redisPrefixNeighbourhood + 'ALL',redisExpiryTimeDay, JSON.stringify(neighbourhoods));
            res.set('Cache-Control', `public, max-age=${redisExpiryTimeDay}`);
            return res.status(200).json({ neighbourhoods, cache: false });
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;