import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, Image } from '../database/models';
import { Op } from 'sequelize';
import * as fs from 'fs';
import checkJwt from '../middleware/authentication.js';
import adminRole from '../middleware/admin.auth.js';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage(), limits: {fileSize: 5000000, files: 1, fields: 10} });

const router = Router({mergeParams: true});
let placeholderImg = null;

const assetsDir = process.env.ASSETS_DIR ? process.env.ASSETS_DIR : '/src/assets';

fs.readFile(process.cwd() + assetsDir + '/placeholder.png', function(err, data) {
    if (err) {
        throw err;
    }
    placeholderImg = data;
    console.log('Loaded placeholder logo successfully.')
});

// Retrieve all images for this merchant
router.get("/", async (req, res) => {
    try {
        const { type } = req.query;

        const merchant = await Merchant.findOne({
            where: { id: req.params.merchantId },
            include: {
                model: Image,
                where: {
                    type: {
                        [Op.iLike]: type ? '%'+type+'%' : '%'
                    }
                },
                through: {
                    attributes: []
                }
            }
        });
        if (merchant) {
            return res.status(200).json(merchant.Images);
        }else{
            return res.status(200).json([]);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Retrieve a logo image
router.get("/logo", async (req, res) => {
    try {
        const { type } = req.query;

        const merchant = await Merchant.findOne({
            where: { id: req.params.merchantId },
            include: {
                model: Image,
                where: {
                    type: {
                        [Op.iLike]: '%LOGO%'
                    }
                },
                through: {
                    attributes: []
                }
            }
        });
        let img;
        if (merchant && merchant.Images && merchant.Images.length) {
            let data = merchant.Images[0].image;
            img = Buffer.from(data, 'base64');
        }else{
            img = placeholderImg;
        }

            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': img.length
            });
            return res.end(img);
            //return res.status(200).send('data:image/png;base64,'+merchant.Images[0].image);
            //return res.status(200).send('<img src=\"data:image/png;base64,'+merchant.Images[0].image+'\">');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/logo", checkJwt, adminRole, upload.single('logo'), async(req, res) => {
    try {
        const  img = req.file;

        if (!img) {
            return res.status(400).json({ message: 'No image uploaded.'});
        }

        if (img.mimetype !== 'image/png') {
            return res.status(400).json({ message: 'Must be image/png.'});
        }

        const merchant = await Merchant.findOne({
            where: {
                id: req.params.merchantId
            },
            include: {
                model: Image,
                where: {
                    type: {
                        [Op.iLike]: '%LOGO%'
                    }
                },
                required: false,
                through: {
                    attributes: []
                }
            }
        });

        if (!merchant) {
            return res.status(404).json({ message: 'Merchant not found.'});
        }

        let image = null;
        if (merchant.Images && merchant.Images.length) {
            image = merchant.Images[0];
            image.image = img.buffer;
            await image.save({ fields: ['image']});
        }else{
            image = await Image.create({
                title: 'Logo',
                type: 'LOGO',
                image: img.buffer
            });
            if (image)
                image.addMerchant(merchant);
        }
        if (!image) {
            return res.status(400).json({ message: 'Invalid img data.'});
        }

        return res.status(201).json({ image });

    } catch (error) {
        if (error.message.startsWith("invalid input syntax for type uuid")) {
            res.status(404).json({ message: 'Merchant not found.'});
        }
        res.status(500).json({ message: error.message });
    }
});

export default router;