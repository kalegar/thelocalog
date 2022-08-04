import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Product, Merchant, Image } from '../database/models';
import { Utils } from '../util.js';

import adminRole from '../middleware/admin.auth.js';
import checkJwt from '../middleware/authentication.js';
import multer from 'multer';
import logger from '../service/logger.service';
const upload = multer({ storage: multer.memoryStorage(), limits: {fileSize: 5000000, files: 1, fields: 10} });

const router = Router();

// Create a new Product
router.post("/", checkJwt, adminRole, upload.single('image'), async (req, res) => {
    try {
        const { merchantId, title, price, description, url } = req.body;

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
  
        const merchant = await Merchant.findOne({
            where: {id : merchantId },
            paranoid: false
        });

        if (!merchant) {
            return res.status(404).json({message: `Merchant with id ${merchantId} not found.`});
        }

        const img = req.file;
        let image = null;
        if (img) {
            if (img.mimetype !== 'image/png') {
                return res.status(400).json({ message: 'Must be image/png.'});
            }
            image = await Image.create({
                title: 'ProductImage',
                type: 'PRODUCTIMAGE',
                image: img.buffer
            });
        }

        const product = await Product.create({
            title,
            MerchantId : merchant.id,
            price,
            description,
            url
        });
        if (image)
            await image.addProduct(product);

        return res.status(201).json({ product });
    } catch (error) {
        logger.error(error);
        let msg = error.message;
        if (process.env.NODE_ENV !== 'development')
            msg = 'An error ocurred.';
        res.status(500).json({ message: msg });
    }
});

// Retrieve all Products
router.get("/", async (req, res) => {
    try {
        const {perpage,page} = req.query;

        let query = {attributes: ['id','title','description','url','inStock','price','imageListing']};

        query.offset = 0;
        query.limit = 2;

        if (perpage) {
            query.limit = Utils.clamp(perpage,0,50);
        }
        if (page) {
            query.offset = Math.max(0,query.limit * (page-1));
        }

        const { count, rows } = await Product.findAndCountAll(query);

        const data = { products: { count, rows }, cached: false};

        res.status(200).json(data);
    } catch (error) {
        logger.error(error);
        let msg = error.message;
        if (process.env.NODE_ENV !== 'development')
            msg = 'An error ocurred.';
        res.status(500).json({ message: msg });
    }
});

// Retrieve a single product by id
router.get("/:productId", async (req, res) => {
    try {
        const product = await Product.findOne({
            where: { id: req.params.productId }
        });

        if(!product) {
            return res.status(404).json({ message: 'the product with the given id was not found' });
        }

        return res.status(200).json({ product });
    } catch (error) {
        logger.error(error);
        let msg = error.message;
        if (process.env.NODE_ENV !== 'development')
            msg = 'An error ocurred.';
        res.status(500).json({ message: msg });
    }
});

// Update a product by id
router.put("/:productId", checkJwt, adminRole, async (req, res) => {
    try {
        const { merchantId, title, description, price, stock } = req.body;
        const products = await Product.update(
        { title, description, MerchantId: merchantId, price, stock },
        {
            returning: true,
            where: { id: req.params.productId }
        }
        );
    
        if (products[0] === 0)
            return res.status(404).json({ message: 'The product with the given id was not found' });
        
        const product = products[1][0].dataValues;

        return res.status(200).json({ product });
    } catch (error) {
        logger.error(error);
        let msg = error.message;
        if (process.env.NODE_ENV !== 'development')
            msg = 'An error ocurred.';
        res.status(500).json({ message: msg });
    }
});

// Delete a product by id
router.delete("/:productId", checkJwt, adminRole, async (req, res) => {
    try {
        const product = await Product.destroy({ where: { id: req.params.productId } });
        if (!product)
            return res.status(404).json({ message: 'The product with the given id was not found' });
    
        return res.status(200).json({ message: 'The product was deleted successfully' });
    } catch (error) {
        logger.error(error);
        let msg = error.message;
        if (process.env.NODE_ENV !== 'development')
            msg = 'An error ocurred.';
        res.status(500).json({ message: msg });
    }
});


export default router;