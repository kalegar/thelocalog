import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, Category } from '../database/models';

const router = Router({mergeParams: true});

// Add a category to this merchant
router.post("/", async (req, res) => {
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
                console.log(error);
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
                console.log(error);
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
                console.log(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            });
        }
    } catch (error) {
        console.log(error);
    }
});

// Retrieve all categories for this merchant
router.get("/", async (req, res) => {
    try {
        const merchant = await Merchant.findOne({
            where: { id: req.params.merchantId }
        });
        const categories = await merchant.getCategories();
        return res.status(200).json({ categories });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove a category from this merchant by id
router.delete("/:id", async (req, res) => {
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