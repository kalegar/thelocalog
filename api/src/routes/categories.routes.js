import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Category, Merchant, Product } from '../database/models';
import { redisClient, redisPrefixCategory, redisExpiryTimeDay } from '../service/redis.service.js';

import checkJwt from '../middleware/authentication.js';
import adminRole from '../middleware/admin.auth.js';
import { UniqueConstraintError } from "sequelize";
import logger from "../service/logger.service";

const router = Router({mergeParams: true});

const refreshCache = async function(type) {
    let categories = [];
    if (type === 'PRODUCTS') {
        categories = await Category.findAll({
            attributes: ['category'],
            order: [['category','asc']],
            include: {
                model: Product,
                required: true,
                attributes: [],
                through: {attributes: []}
            }
        });
    }else if (type === 'MERCHANTS') {
        categories = await Category.findAll({
            attributes: ['category'],
            order: [['category','asc']],
            include: {
                model: Merchant,
                required: true,
                attributes: [],
                through: {attributes: []}
            }
        });
    }else if (type === 'ALL') {
        categories = await Category.findAll();
    }
    redisClient.setex(redisPrefixCategory + type,redisExpiryTimeDay, JSON.stringify(categories));
    return categories;
}

const retrieveFromCache = function(type) {
    return new Promise((resolve, reject) => {
        try {
            redisClient.get(redisPrefixCategory + type, async (err, reply) => {
                if (reply) {
                    resolve(JSON.parse(reply));
                } else {
                    refreshCache(type).then((categories) => {
                        resolve(categories);
                    }, (rej) => {
                        reject(rej);
                    });
                }
            });
        } catch (error) {
            logger.error(error);
            reject(error);
        }
    });
};

const handleCategoriesRequest = function(type, req, res) {
    try {
        retrieveFromCache(type).then(categories => {
            res.set('Cache-Control', `public, max-age=${redisExpiryTimeDay}`);
            return res.status(200).json({ categories });
        }, error => {
            logger.error(error);
            return res.status(500).json({ message: error.message });
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: error.message });
    }
};

// Retrieve all categories
router.get("/", async (req, res) => {
    return handleCategoriesRequest('ALL',req,res);
});

// Retrieve all categories that have at least 1 product attached.
router.get("/products", async (req, res) => {
    return handleCategoriesRequest('PRODUCTS',req,res);
})

//Get the products in the specified category
router.get("/products/:category", checkJwt, adminRole, async (req, res) => {
    try {
        const category = req.params.category;
        const products = await Product.findAll({
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
        return res.status(200).json({ products });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Retrieve all categories that have at least 1 merchant attached.
router.get("/merchants", async (req, res) => {
    return handleCategoriesRequest('MERCHANTS',req,res);
})

//Get the merchants in the specified category
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