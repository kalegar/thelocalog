import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, Product, User, Image, Category } from '../database/models';
import jwtAuthz from 'express-jwt-authz';
import { Op } from 'sequelize';
import checkJwt from '../middleware/authentication.js';
import userOwnsMerchant from '../middleware/merchantOwner.middleware.js';
import multer from 'multer';
import logger from '../service/logger.service';
import { Utils } from '../util.js';
const upload = multer({ storage: multer.memoryStorage(), limits: {fileSize: 5000000, files: 1, fields: 10} });

const router = Router({mergeParams: true});

// Upload products in bulk via a JSON file.
router.post("/bulk", checkJwt, userOwnsMerchant, upload.single('data'), async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
        const userId = req.user.sub;
        const merchant = await Merchant.findOne({
            where: {id : merchantId },
            paranoid: false
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

        const dataFile = req.file;
        if (dataFile) {
            if (dataFile.mimetype !== 'application/json') {
                return res.status(400).json({ message: `Must be application/json. Got '${dataFile.mimetype}'`});
            }
            const fileText = Buffer.from(dataFile.buffer).toString("utf-8");
            const json = JSON.parse(fileText);
            if (! Array.isArray(json)) {
                return res.status(400).json({ message: 'json is not an array.'});
            }
            if (!json.length) {
                return res.status(400).json({ message: 'json is empty array.'});
            }
            try {

                const addCategories = function(categories,productModel) {
                    if (categories != null && Array.isArray(categories) && categories.length) {
                        categories.forEach(category => {
                            Category.findOrCreate({
                                where: { category: category.toUpperCase() },
                                defaults: { category: category }
                            }).then((categories) => {
                                categories[0].addProduct(productModel).catch((error) => {
                                    logger.error(error);
                                });
                            }).catch((error) => {
                                logger.error(error);
                            });
                        })
                        
                    }
                }

                await Promise.all(json.map(prod => {
                    let product = prod;
                    product.MerchantId = merchant.id;
                    let promise;
                    if (product.externalId && product.externalId !== null && product.externalId.length) {
                        return Product.findOne({ where: {
                            externalId: product.externalId
                        }}).then(p => {
                            if (p === null) {
                                promise = Product.create(product);
                            }else{
                                promise = p.update(product);
                            }
                            promise.then((newproduct) => {
                                addCategories(product.categories,newproduct);
                            });
                        }).catch(e => {
                            logger.error(e);
                        });
                    }else{
                        return Product.create(product).then(newproduct => {
                            addCategories(product.categories,newproduct);
                        });
                    }
                }));
                return res.status(201).json({ message:`Uploaded ${json.length} products.`});
            } catch (e) {
                logger.error(e);
                return res.status(400).json({ message: 'Error parsing json'});
            }
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Create a new product for this merchant.
router.post("/", checkJwt, userOwnsMerchant, upload.single('image'), async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
        const { title, price, description, url } = req.body;
        const userId = req.user.sub;

        const merchant = await Merchant.findOne({
            where: {id : merchantId },
            paranoid: false
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
        res.status(500).json({ message: error.message });
    }
});

// Get products for this merchant
router.get("/", async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
        const {perpage,page,q,c: categoriesStr} = req.query;

        let query = {attributes: ['id','title','description','url','inStock','price','imageListing','imageUrl']};

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

        if (q && q.length) {
            let words = q.split(" ").map(s => `%${s.trim()}%`);
            if (words.length > 1) {
                console.log(words);
                query.where.title = {
                    [Op.iLike]: { [Op.any]: words}
                }
            }else{
                query.where.title = {
                    [Op.iLike]: `%${q}%`
                }
            }
        }

        if (categoriesStr && categoriesStr.length) {
            const categories = categoriesStr.split(",").map(cat => cat.toUpperCase().trim());
            query.include = {
                model: Category,
                attributes: [],
                through: { attributes: [] },
                where: {
                    category: {
                        [Op.in]: categories
                    }
                }
            }
        }

        const { count, rows } = await Product.findAndCountAll(query);

        const data = { products: { count, rows, page, pages: Math.ceil(Number(count) / Number(perpage)) }, cached: false};

        res.status(200).json(data);

    } catch (error) {
        logger.error(error);
        let msg = error.message;
        if (process.env.NODE_ENV !== 'development')
            msg = 'An error ocurred.';
        res.status(500).json({ message: msg });
    }
});

router.get("/:productId", async (req, res) => {
    try {
        const productId = req.params.productId;

        const product = await Product.findOne({
            where: {id : productId},
            attributes: ['id','title','description','url','inStock','price','imageListing','imageUrl']
        });

        if (!product) {
            return res.status(404).json({message: `Product with id ${productId} not found.`});
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

router.delete("/:productId", checkJwt, userOwnsMerchant, async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
        const productId = req.params.productId;

        const product = await Product.findOne({
            where: {id : productId, MerchantId: merchantId}
        });

        if (!product) {
            return res.status(404).json({message: `Product with id ${productId} on merchant ${merchantId} not found.`});
        }
        await product.destroy();
        return res.status(200).json({ message: 'Success.' });
    } catch (error) {
        logger.error(error);
        let msg = error.message;
        if (process.env.NODE_ENV !== 'development')
            msg = 'An error ocurred.';
        res.status(500).json({ message: msg });
    }
});

export default router;