import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, sequelize } from '../database/models';
import { QueryTypes } from 'sequelize';

const router = Router({mergeParams: true});

router.get('/', async (req, res) => {
    try {
        const {lat,lon,radius} = req.query;

        const merchants = await sequelize.query(`SELECT m.* FROM "Merchants" m join "MerchantAddresses" ma on m.id = ma."MerchantId" join "Addresses" a on ma."AddressId" = a.id where ST_DWithin(a.geom, ST_MakePoint(:lat, :lon)::geography, :radius);`,
        {
            replacements: {
                lat,
                lon,
                radius: radius > 0 && radius < 50000 ? radius : 10000
            },
            type: QueryTypes.SELECT
        });

        if (merchants) {
            return res.status(200).json({merchants});
        }else{
            return res.status(200).json([]);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;