import "core-js/stable";
import "regenerator-runtime/runtime";

import axios from 'axios';
import { Router } from 'express';
import { Merchant } from '../database/models';
import redisClient from '../redis-client.js';

const router = Router({mergeParams: true});

const cachePrefix = 'HOURS/';
const cacheDuration = 604800;

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

                    const data = {
                        status: 'NO_INFO',
                        address_id: address.id
                    };

                    if (!address.placeid) {
                        let pid = await getPlaceID(merchant.title,address);
                        if (pid !== -1) {
                            address.placeid = pid;
                        }else{
                            //No placeid in DB or from Places API. skip this address.
                            continue;
                        }
                    }
                    const placeid = address.placeid;
                    const placeDetails = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?key=${process.env.GOOGLE_PLACES_API_KEY}&place_id=${placeid}&fields=opening_hours,business_status,geometry`)

                    data.place_id = placeid;

                    if (placeDetails.data.status && placeDetails.data.status == "OK") {
                        if (placeDetails.data.result.business_status) {
                            data.status = placeDetails.data.result.business_status;
                        }
                        if (placeDetails.data.result.opening_hours) {
                            data.hours = placeDetails.data.result.opening_hours.weekday_text;
                            data.periods = placeDetails.data.result.opening_hours.periods;
                        }
                        if (placeDetails.data.result.geometry && placeDetails.data.result.geometry.location && !address.geom) {
                            //Need to specify SRID for compat with PostGIS < 3.0.0
                            address.geom = { type: 'Point', coordinates: [placeDetails.data.result.geometry.location.lat,placeDetails.data.result.geometry.location.lng], crs: { type: 'name', properties: { name: 'EPSG:4326'} }};
                            console.log('Address geom was updated. Saving...');
                            await address.save({fields: ['geom', 'placeid']});
                            console.log('Saved!');
                        }
                    }
                    dataArray.push(data);  
                }

                if (dataArray.length > 0) {
                    redisClient.setex(cachePrefix+merchantId, cacheDuration, JSON.stringify(dataArray));
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

const getPlaceID = async function(merchantTitle,address) {
    const query = getQueryFromAddress(merchantTitle,address);
    const place = await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key=${process.env.GOOGLE_PLACES_API_KEY}&input=${query}&inputtype=textquery&fields=place_id`);

    if (place && place.data && place.data.candidates) {
        if (place.data.status == 'ZERO_RESULTS')
            return -1;
        return place.data.candidates[0].place_id;
    }
    return -1;             
}

export default router;