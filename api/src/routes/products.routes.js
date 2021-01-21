import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Product } from '../database/models';

const router = Router({mergeParams: true});

// Create a new Product
router.post("/", async (req, res) => {
    try {
        const { title, description, price, stock } = req.body;
        const merchantId = req.params.merchantId;

        if (!title) {
            return res.status(400).send({
                message: "title is required!"
            })
        }
        if (!merchantId) {
            return res.status(400).send({
                message: "merchantId is required!"
            })
        }
        if (!price) {
            return res.status(400).send({
                message: "price is required!"
            })
        }
        if (!stock) {
            return res.status(400).send({
                message: "stock is required!"
            })
        }
  
        const product = await Product.create({
            title,
            description,
            MerchantId: merchantId,
            price,
            stock
        });

        return res.status(201).json({ product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Retrieve all Products
router.get("/", async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { MerchantId: req.params.merchantId }
        });
        return res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Retrieve a single product by id
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findOne({
            where: { id: req.params.id }
        });

        if(!product) {
            return res.status(404).json({ message: 'the product with the given id was not found' });
        }

        return res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a product by id
router.put("/:id", async (req, res) => {
    try {
        const { title, description, price, stock } = req.body;
        const products = await Product.update(
        { title, description, MerchantId: req.params.merchantId, price, stock },
        {
            returning: true,
            where: { id: req.params.id }
        }
        );
    
        if (products[0] === 0)
            return res.status(404).json({ message: 'The product with the given id was not found' });
        
        const product = products[1][0].dataValues;

        return res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a product by id
router.delete("/:id", async (req, res) => {
    try {
        const product = await Product.destroy({ where: { id: req.params.id } });
        if (!product)
            return res.status(404).json({ message: 'The product with the given id was not found' });
    
        return res.status(200).json({ message: 'The product was deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;