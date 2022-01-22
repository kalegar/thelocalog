import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, Product, User, Image } from '../database/models';
import jwtAuthz from 'express-jwt-authz';
import checkJwt from '../middleware/authentication.js';
import userOwnsMerchant from '../middleware/merchantOwner.middleware.js';
import multer from 'multer';
import logger from '../service/logger.service';
const upload = multer({ storage: multer.memoryStorage(), limits: {fileSize: 5000000, files: 1, fields: 10} });

const router = Router({mergeParams: true});

// Create a new product for this merchant.
router.post("/", checkJwt, userOwnsMerchant, upload.single('image'), async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
        const { title, price, description, url } = req.body;
        const userId = req.user.sub;

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

        const merchant = await Merchant.findOne({
            where: {id : merchantId }
        });
        const user = await User.findOne({
            where: {id : userId}
        });
        if (!merchant) {
            return res.status(404).json({message: `Merchant with id ${merchantId} not found.`});
        }
        if (!user) {
            return res.status(404).json({message: `User with id ${userId} not found.`});
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
        res.status(500).json({ message: error.message });
    }
});

// Get products for this merchant
router.get("/", async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
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

        query.where = {
            MerchantId: merchantId
        }

        const { count, products } = await Product.findAndCountAll(query);

        const data = { products: { count, rows: products }, cached: false};

        res.status(200).json(data);

    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: error.message });
    }
});

export default router;