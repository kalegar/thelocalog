import "core-js/stable";
import "regenerator-runtime/runtime";

import axios from 'axios';
import redis from 'redis';
import { Router } from 'express';
import { Merchant } from '../database/models';

const router = Router({mergeParams: true});

const cachePrefix = 'HOURS/';
const cacheDuration = 604800;

const redisClient = redis.createClient({url: process.env.REDIS_URL || 'redis://localhost'});

const getQueryFromAddress = function(title,address) {
    return (title+' '+address.address1 + 
                (address.address2 ? ' ' + address.address2 : '') +
                (address.address3 ? ' ' + address.address3 : '') +
                (address.city ? ' ' + address.city: '') +
                (address.province ? ' ' + address.province: '') +
                (address.postalcode ? ' ' + address.postalcode: '')
    ).replace('#','');
}

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
                for (const address of addresses) {
                    const query = getQueryFromAddress(merchant.title,address);
        
                    const place = await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key=${process.env.GOOGLE_PLACES_API_KEY}&input=${query}&inputtype=textquery&fields=place_id`);
            
                    if (place.data && place.data.candidates) {
                        console.log('Got response from Google Places Library:');
                        console.log(place);
                        console.log(place.data);
                        const placeid = place.data.candidates[0].place_id;
                        const placeDetails = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?key=${process.env.GOOGLE_PLACES_API_KEY}&place_id=${placeid}&fields=opening_hours`)

                        const data = {
                            address_id: address.id,
                            place_id: placeid,
                            hours: placeDetails.data.result.opening_hours.weekday_text,
                            periods: placeDetails.data.result.opening_hours.periods
                        }

                        dataArray.push(data);
                    }
                }

                if (dataArray.length > 0) {
                    redisClient.setex(cachePrefix+merchantId, cacheDuration, JSON.stringify(dataArray));
                    return res.status(200).json({data: dataArray, cache: false});
                }else {
                    return res.status(500).json(place);
                }
            }
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;