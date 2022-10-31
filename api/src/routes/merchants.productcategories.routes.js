import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Product, Category } from '../database/models';
import logger from "../service/logger.service";
import { redisClient, redisPrefixCategory, redisExpiryTimeShort } from '../service/redis.service.js';

const router = Router({mergeParams: true});

// Get product categories for the current merchant.
router.get("/", async(req, res) => {
    try {
        const merchantId = req.params.merchantId;

        const redisKey = `${redisPrefixCategory}_PRODUCTS_${merchantId}`;

        redisClient.get(redisKey, async function(err, reply) {
            // Not in cache, load from DB
            if (err || !reply) {
                const sql = `SELECT DISTINCT C."id", C."category" FROM ` +
                    `  "Categories" C ` +
                    `  JOIN "ProductCategories" PC ON C."id" = PC."CategoryId" ` +
                    `  JOIN "Products" P ON P."id" = PC."ProductId" ` +
                    `WHERE ` +
                    `  P."MerchantId" = :MerchantId ` +
                    `ORDER BY ` +
                    `  C."id" ASC`;

                const replacements = {
                    MerchantId: merchantId
                }

                const categories = await Category.sequelize.query(
                    sql,
                    {
                        model: Category,
                        mapToModel: true,
                        replacements
                    }
                );
                const data = { categories, cached: false }
                redisClient.setex(redisKey,redisExpiryTimeShort,JSON.stringify(data));
                res.set('Cache-Control', `public, max-age=${redisExpiryTimeShort}`);
                return res.status(200).json(data);
            }else{
                const data = { categories: JSON.parse(reply), cached: true }
                res.set('Cache-Control', `public, max-age=${redisExpiryTimeShort}`);
                return res.status(200).json(data);
            }
        });

        

        
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: error.message });
    }

});

router.get("/:categoryId", async(req, res) => {
    try {
        const merchantId = req.params.merchantId;
        const categoryId = req.params.categoryId;

        const sql = `SELECT DISTINCT C."id", C."category" FROM ` +
                    `  "Categories" C ` +
                    `  JOIN "ProductCategories" PC ON C."id" = PC."CategoryId" ` +
                    `  JOIN "Products" P ON P."id" = PC."ProductId" ` +
                    `WHERE ` +
                    `  P."MerchantId" = :MerchantId ` +
                    `  AND C."id" = :CategoryId`;

        const replacements = {
            MerchantId: merchantId,
            CategoryId: categoryId
        }

        const category = await Category.sequelize.query(
            sql,
            {
                model: Category,
                mapToModel: true,
                replacements
            }
        );

        if (!category || category.length == 0) {
            return res.status(404).json({ message: `Category with id '${categoryId}' not found.`});
        }

        return res.status(200).json(category);
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/:categoryId/products", async(req, res) => {
    try {
        const merchantId = req.params.merchantId;
        const categoryId = req.params.categoryId;

        const sql = `SELECT P.* FROM ` +
                    `  "Products" P ` +
                    `  JOIN "ProductCategories" PC ON P."id" = PC."ProductId" ` +
                    `WHERE ` +
                    `  P."MerchantId" = :MerchantId ` +
                    `  AND PC."CategoryId" = :CategoryId`;

        const replacements = {
            MerchantId: merchantId,
            CategoryId: categoryId
        };

        const products = await Product.sequelize.query(
            sql,
            {
                model: Product,
                mapToModel: true,
                replacements
            }
        );

        return res.status(200).json(products);

    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: error.message });
    }
});

export default router;