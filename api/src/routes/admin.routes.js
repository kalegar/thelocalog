import "core-js/stable";
import "regenerator-runtime/runtime";

import axios from 'axios';
import { Router } from 'express';
import { Op } from 'sequelize';
import { Merchant, MerchantClaim, User, Address } from '../database/models';
import { Utils } from '../util.js';

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
                const place = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?key=${process.env.GOOGLE_PLACES_API_KEY}&place_id=${address.placeid}&fields=geometry`);
                if (place.data.status && place.data.status == "OK") {
                    const candidate = place.data.result;
                    if (candidate.geometry && candidate.geometry.location) {
                        //Need to specify SRID for compat with PostGIS < 3.0.0
                        address.geom = { type: 'Point', coordinates: [candidate.geometry.location.lat,candidate.geometry.location.lng], crs: { type: 'name', properties: { name: 'EPSG:4326'} }};
                        console.log('Address geom was updated. Saving...');
                        await address.save({fields: ['geom']});
                        console.log('Saved!');
                        count ++;
                    }
                }
            }else {
                const merchants = await address.getMerchants({attributes: ['title']});
                const place = await getPlace(merchants[0].title,address);
                console.log('PLACE: ' +place);
                if (place && place.data && place.data.candidates) {
                    if (place.data.status == 'ZERO_RESULTS') {
                        responseMessage = responseMessage + `Skipped address id ${address.id} (${merchants[0].title}, ${address.full}), no results found. \n`;
                        continue;
                    }
                    const candidate = place.data.candidates[0];

                    const placeid = candidate.place_id;
                    address.placeid = placeid;

                    if (place.data.status && place.data.status == "OK") {
                        if (candidate.geometry && candidate.geometry.location) {
                            //Need to specify SRID for compat with PostGIS < 3.0.0
                            address.geom = { type: 'Point', coordinates: [candidate.geometry.location.lat,candidate.geometry.location.lng], crs: { type: 'name', properties: { name: 'EPSG:4326'} }};
                            await address.save({fields: ['geom', 'placeid']});
                            count ++;
                        }
                    }
                }
            }
        }


        responseMessage = `Updated ${count} of ${queryResult.count} address geometries. \n${responseMessage}`;
        return res.status(200).json({ message: responseMessage});

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const getPlace = async function(merchantTitle, address) {
    let query = Utils.getQueryFromAddress(merchantTitle,address);
    let place = await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key=${process.env.GOOGLE_PLACES_API_KEY}&input=${query}&inputtype=textquery&fields=place_id,geometry`);
    if (place) {
        if (place.data.status == 'ZERO_RESULTS') {
            query = Utils.getQueryFromAddress('',address);
            place = await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key=${process.env.GOOGLE_PLACES_API_KEY}&input=${query}&inputtype=textquery&fields=place_id,geometry`);
            if (place){
                if (place.data.status == 'ZERO_RESULTS') {
                    return null;
                }
                return place;
            }
        }
        return place;
    }
    return null;
}

export default router;