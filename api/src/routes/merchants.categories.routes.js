import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, Category } from '../database/models';
import { Op, QueryTypes } from 'sequelize';
import checkJwt from '../middleware/authentication.js';
import userOwnsMerchant from '../middleware/merchantOwner.middleware.js';
import logger from "../service/logger.service";

const router = Router({mergeParams: true});

// Add a category to this merchant
// The category must exist, or the 'force' parameter can be passed, 
// and the category will be created and added to the merchant.
router.post("/", checkJwt, userOwnsMerchant, async (req, res) => {
    try {
        const { category, force } = req.body;

        if (!category) {
            return res.status(400).json( { message: 'Must specify "category"' });
        }

        const merchant = await Merchant.findOne({
            where: { id: req.params.merchantId }
        });
        if (!merchant) {
            return res.status(404).json({ message: 'The merchant with the given id was not found'});
        }

        const applyCategory = function(newCategory) {
            newCategory.addMerchant(merchant).then(() => {
                return res.status(200).json({ newCategory });
            }).catch((error) => {
                logger.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            });
        }

        if (force) {
            Category.findOrCreate({
                where: { category: category.toUpperCase() },
                defaults: { category: category }
            }).then((categories) => {
                applyCategory(categories[0]);
            }).catch((error) => {
                logger.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            });
        }else{
            Category.findOne({
                where: {category: category.toUpperCase() }
            }).then((cat) => {
                if (!cat) {
                    return res.status(404).json({ message: 'The category with the given name was not found'});
                }
                applyCategory(cat);
            }).catch((error) => {
                logger.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            });
        }
    } catch (error) {
        logger.error(error);
    }
});

//Set the categories for this merchant. Will delete all existing categories on the merchant first, then attach the supplied categories.
//The supplied categories must already exist.
router.put("/bulk", checkJwt, userOwnsMerchant, async (req, res) => {
    try {

        const merchant = await Merchant.findOne({
            where: {id : req.params.merchantId }
        });

        if (!merchant) {
            return res.status(404).json({ message: 'Merchant not found.' });
        }

        const { categories } = req.body;
        let categoryArray = [];
        if (Array.isArray(categories)) {
            categoryArray = categories.map((cat) => cat.toUpperCase());
        }else{
            categoryArray = [categories.toUpperCase()];
        }

        const deleteSQL = `DELETE FROM "MerchantCategories" WHERE "MerchantId" = :merchantId`;
        Merchant.sequelize.query(deleteSQL, { type: QueryTypes.DELETE, raw: true, replacements: { merchantId: req.params.merchantId }}).then(
            () => {
                Category.findAll({ where: {
                    category: {
                        [Op.in]: categoryArray
                    }
                }}).then((results) => {
                    merchant.addCategories(results);
                });
            }
        )

        res.status(202).json({ message: `Set ${categoryArray.length} categories.`});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Retrieve all categories for this merchant
router.get("/", async (req, res) => {
    try {
        const merchant = await Merchant.findOne({
            where: { id: req.params.merchantId },
            include: {
                model: Category,
                through: {
                    attributes: []
                }
            }
        });
        const categories = merchant.Categories;
        return res.status(200).json({ categories });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove a category from this merchant by id
router.delete("/:id", checkJwt, userOwnsMerchant, async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
        const merchant = await Merchant.findOne({
            where: { id: merchantId }
        });
        if (!merchant) {
            return res.status(404).json({ message: 'The merchant with the given id was not found' });
        }
        const category = await Category.findOne({
            where: { id: req.params.id }
        })
        if (!category) {
            return res.status(404).json({ message: 'The category with the given id was not found' });
        }
        merchant.removeCategory(category).then(() => {
            return res.status(200).json({ message: 'The category was removed successfully' });
        }).catch(() => {
            return res.status(500).json({ message: 'An error occurred' });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;