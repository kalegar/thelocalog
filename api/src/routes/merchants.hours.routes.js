import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant } from '../database/models';
import { GoogleAPIService } from '../service/google-api.service.js';
import redisClient from '../service/redis.service.js';
import { LoggingService } from '../service/logging.service.js';
import { Utils } from '../util.js';

const router = Router({mergeParams: true});

const cachePrefix = 'HOURS/';
const cacheDuration = 604800;
const cacheDurationNoInfo = 3600;

// Get a placeid from a query
router.get("/", async (req, res) => {
    try {
        const merchantId = req.params.merchantId;

        redisClient.get(cachePrefix+merchantId, async (err, placestr) => {
            if (placestr) {
                const data = JSON.parse(placestr);
                return res.status(200).json({data: data, cache: true});
            }else{
                const merchant = await Merchant.findOne({
                    where: {id : merchantId }
                });
                if (!merchant) {
                    return res.status(404).json({ message: 'The merchant with the given id was not found'});
                }
                const addresses = await merchant.getAddresses();
                
                const dataArray = []
                let noInfo = false;
                for (const address of addresses) {

                    const data = {
                        status: 'NO_INFO',
                        address_id: address.id
                    };

                    let updateFields = [];

                    if (!address.placeid) {
                        const place = await GoogleAPIService.getPlace(merchant.title,address);
                        if (place && place.place_id) {
                            address.placeid = place.place_id;
                            updateFields.push('placeid');
                        }else{
                            //No placeid in DB or from Places API. skip this address.
                            continue;
                        }
                    }
                    const placeid = address.placeid;
                    const placeDetails = await GoogleAPIService.getPlaceDetails(placeid,'opening_hours,business_status,geometry');

                    data.place_id = placeid;

                    if (placeDetails) {
                        //Update address place_id in case it was refreshed.
                        if (address.placeid !== placeDetails.place_id) {
                            address.placeid = placeDetails.place_id;
                            updateFields.push('placeid');
                        }
                        data.place_id = placeDetails.place_id;
                        if (placeDetails.business_status) {
                            data.status = placeDetails.business_status;
                        }
                        if (placeDetails.opening_hours) {
                            data.hours = placeDetails.opening_hours.weekday_text;
                            data.periods = placeDetails.opening_hours.periods;
                        }
                        if (placeDetails.geometry && placeDetails.geometry.location && !address.geom) {
                            //Need to specify SRID for compat with PostGIS < 3.0.0
                            address.geom = Utils.createGeom(placeDetails.geometry.lng,placeDetails.geometry.lat);
                            updateFields.push('geom');
                        }
                    }
                    if (updateFields.length) {
                        LoggingService.log(`Updating Address fields: ${updateFields.join(', ')}`);
                        await address.save({fields: updateFields});
                        LoggingService.log('Updated!');
                    }
                    dataArray.push(data);  

                    if (data.status === 'NO_INFO') {
                        noInfo = true;
                    }
                }

                if (dataArray.length > 0) {
                    redisClient.setex(cachePrefix+merchantId, noInfo ? cacheDurationNoInfo : cacheDuration, JSON.stringify(dataArray));
                    return res.status(200).json({data: dataArray, cache: false});
                }else {
                    return res.status(500).json({data: dataArray, cache: false});
                }
            }
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;