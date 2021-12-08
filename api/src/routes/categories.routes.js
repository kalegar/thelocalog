import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Category, Merchant } from '../database/models';
import { redisClient, redisPrefixCategory, redisExpiryTimeDay } from '../service/redis.service.js';

import checkJwt from '../middleware/authentication.js';
import adminRole from '../middleware/admin.auth.js';
import { UniqueConstraintError } from "sequelize";
import logger from "../service/logger.service";

const router = Router({mergeParams: true});

const refreshCache = async function() {
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
    return categories;
}

// Retrieve all categories
router.get("/", async (req, res) => {
    try {
        redisClient.get(redisPrefixCategory + 'ALL', async (err, reply) => {
            if (reply) {
                const data = JSON.parse(reply);
                res.set('Cache-Control', `public, max-age=${redisExpiryTimeDay}`);
                return res.status(200).json({ categories: data});
            }
            const categories = await refreshCache();
            res.set('Cache-Control', `public, max-age=${redisExpiryTimeDay}`);
            return res.status(200).json({ categories });
        });
        
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/all", checkJwt, async (req, res) => {
    try {
        const categories = await Category.findAll();
        return res.status(200).json({ categories });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/merchants/:category", checkJwt, adminRole, async (req, res) => {
    try {
        const category = req.params.category;
        const merchants = await Merchant.findAll({
            attributes: ['id', 'title'],
            order: [['title', 'asc']],
            include: {
                model: Category,
                required: true,
                attributes: [],
                where: {
                    category: category.toUpperCase()
                },
                through: {attributes: []}
            }
        });
        return res.status(200).json({ merchants });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.post("/:category", checkJwt, adminRole, async (req, res) => {
    const cat = req.params.category;
    const category = Category.build({ category: cat });
    try {
        await category.save();
        const categories = await Category.findAll();
        res.status(201).json({ categories });
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            res.status(400).json({ message: 'Category already exists.'});
        } else {
            logger.error(err);
            res.status(500).json({ message: err.message });
        }
    }
});

router.delete("/:category", checkJwt, adminRole, async (req, res) => {
    const cat = req.params.category;
    if (cat == null || cat.length < 1) {
        res.status(404).json({message: 'Category does not exist.'});
        return;
    }
    try {
        await Category.destroy({ where: {
            category: cat.toUpperCase()
        }});
        res.status(200).send();
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: error.message });
    }
})

export default router;