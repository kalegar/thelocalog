import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Op } from 'sequelize';
import { Merchant, MerchantClaim, User, Address } from '../database/models';
import { GoogleAPIService } from '../service/google-api.service.js';
import { LoggingService } from '../service/logging.service.js';
import { Utils } from '../util.js';
import { redisClient, redisPrefixHours } from '../service/redis.service.js';

const router = Router();

//endpoint to authenticate administrators
router.get("/", async(req, res) => {
    return res.status(200).json({ message: 'Authenticated.'});
})

// Retrieve all Merchant Claims
router.get("/claims", async (req, res) => {
    try {
        const claims = await MerchantClaim.findAll({
            include: [{
                model: Merchant,
                attributes: ['title']
            }]
        });
        // const tags = await merchant.getTags({through: {attributes: []}});
        return res.status(200).json({ claims });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/claims/:claimId", async (req, res) => {
    try {
        const claim = await MerchantClaim.findOne({
            where: {
                id: req.params.claimId
            },
            include: [
                { model: Merchant },
                { model: User }
            ]
        });
        return res.status(200).json({ claim });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/hours/clearcache", async(req, res) => {
    redisClient.KEYS(`${redisPrefixHours}*`, function(err, result) {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: err.message });
        }
        const count = result.length;
        for (const key of result) {
            redisClient.DEL(key);
        }
        return res.status(200).json({ message: `Cleared ${count} keys.` });
    });
});

router.get("/populategeo", async (req, res) => {
    try {
        const queryResult = await Address.findAndCountAll({
            where: {
                geom: {
                    [Op.is]: null
                }
            },
            limit: 10
        });

        if (req.query.count) {
            return res.status(200).json({ count: queryResult.count });
        }
        const addresses = queryResult.rows;
        if (queryResult.count == 0) {
            return res.status(200).json({ message: 'All addresses have geometry. '});
        }
        let responseMessage = '';
        let count = 0;
        for (const address of addresses) {
            if (address.placeid) {
                const placeDetails = await GoogleAPIService.getPlaceDetails(address.placeid,'geometry');
                if (!placeDetails) {
                    LoggingService.log("Address placeid not found. Clearing.");
                    address.placeid = null;
                } else {
                    if (placeDetails.geometry && placeDetails.geometry.location) {
                        address.geom = Utils.createGeom(placeDetails.geometry.location.lng,placeDetails.geometry.location.lat);
                        LoggingService.log('Address geom was updated. Saving...');
                        await address.save({fields: ['geom']});
                        LoggingService.log('Saved!');
                        count ++;
                    }
                }
            }
            if (!address.placeid) {
                const merchants = await address.getMerchants({attributes: ['title'], paranoid: false});
                const place = await GoogleAPIService.getPlace(merchants[0].title,address);
                if (place) {
                    address.placeid = place.place_id;
                    if (place.geometry && place.geometry.location) {
                        address.geom = Utils.createGeom(place.geometry.location.lng,place.geometry.location.lat);
                        await address.save({fields: ['geom', 'placeid']});
                        count ++;
                    }
                } else {
                    responseMessage = responseMessage + `Skipped address id ${address.id} (${merchants[0].title}, ${address.full}), no results found. \n`;
                }
            }
        }


        responseMessage = `Updated ${count} of ${queryResult.count} address geometries. \n${responseMessage}`;
        return res.status(200).json({ message: responseMessage});

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;