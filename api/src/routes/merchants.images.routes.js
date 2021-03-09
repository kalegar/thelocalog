import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, Image } from '../database/models';
import { Op } from 'sequelize';

const router = Router({mergeParams: true});

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
        if (merchant && merchant.Images && merchant.Images.length) {
            let data = merchant.Images[0].image;
            let img = Buffer.from(data, 'base64');

            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': img.length
            });
            return res.end(img);
            //return res.status(200).send('data:image/png;base64,'+merchant.Images[0].image);
            //return res.status(200).send('<img src=\"data:image/png;base64,'+merchant.Images[0].image+'\">');
        }else{
            return res.status(200).json([]);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;