import "core-js/stable";
import "regenerator-runtime/runtime";

import axios from 'axios';
import { Utils } from '../util.js';
import logger from "./logger.service";

export const GoogleAPIService = {

    getPlaceDetails: async function(place_id,fields) {
        logger.info(`Getting Place Details for ${place_id}, fields=${fields}`);
        const details = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?key=${process.env.GOOGLE_PLACES_API_KEY}&place_id=${place_id}&fields=${fields}`);

        if (details.data.status == "NOT_FOUND") {
            logger.info('place_id expired. Making refresh call.');
            const result = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?key=${process.env.GOOGLE_PLACES_API_KEY}&place_id=${place_id}&fields=place_id`);
            if (result.data.status == "NOT_FOUND") {
                logger.info('Failed to refresh place_id.');
                return null;
            }
            logger.info('Refreshed place id. Calling getPlaceDetails again.');
            return await this.getPlaceDetails(result.data.result.place_id,fields);
        } else if (details.data.status == "OK") {
            let res = details.data.result;
            if (!res.place_id) {
                res.place_id = place_id;
            }
            return res;
        } else {
            logger.info(`Error on place details request: ${details.data.status}`);
            return null;
        }
    },

    getPlace: async function(merchantTitle, address) {
        logger.info(`Searching for Place`);

        let query = `${merchantTitle} ${address.address1} ${address.city}`;
        let place = await this.getPlaceHelper(query);
        if (place) {
            if (place.formatted_address.toUpperCase().includes(address.city.toUpperCase()) || place.name.toUpperCase().includes(merchantTitle.toUpperCase())) {
                logger.info('Found place matching on Title, Address line 1, and City');
                logger.info(place);
                return place;
            }
        }

        query = `${merchantTitle} ${address.city}`;
        place = await this.getPlaceHelper(query);
        if (place) {
            if (place.formatted_address.toUpperCase().includes(address.city.toUpperCase()) || place.name.toUpperCase().includes(merchantTitle.toUpperCase())) {
                logger.info('Found place matching on Title and City');
                logger.info(place);
                return place;
            }
        }

        query = `${address.address1} ${address.city}`;
        place = await this.getPlaceHelper(query);
        if (place) {
            if (place.formatted_address.toUpperCase().includes(address.city.toUpperCase()) || place.name.toUpperCase().includes(merchantTitle.toUpperCase())){
                logger.info('Found place matching on Address Line 1 and City');
                logger.info(place);
                return place;
            }
        }

        query = Utils.getQueryFromAddress(merchantTitle,address);
        place = await this.getPlaceHelper(query);
        if (place) {
            if (place.formatted_address.toUpperCase().includes(address.city.toUpperCase()) || place.name.toUpperCase().includes(merchantTitle.toUpperCase())){
                logger.info('Found place matching on full query');
                logger.info(place);
                return place;
            }
        }

        query = Utils.getQueryFromAddress('',address);
        place = await this.getPlaceHelper(query);
        if (place) {
            if (place.formatted_address.toUpperCase().includes(address.city.toUpperCase()) || place.name.toUpperCase().includes(merchantTitle.toUpperCase())){
                logger.info('Found place matching on address only query');
                logger.info(place);
                return place;
            }
        }

        let geocode = await this.getGeocodeHelper(`${address.address1}, ${address.city}, ${address.province}`);
        if (geocode) {
            logger.info('Found place matching on geocode.');
            logger.info(place);
            return geocode;
        }
        logger.info('Failed to find match.');
        return null;
    },

    getPlaceHelper: async function(query) {
        const cleanQuery = encodeURIComponent(query);
        const place = await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key=${process.env.GOOGLE_PLACES_API_KEY}&input=${cleanQuery}&inputtype=textquery&fields=formatted_address,name,place_id,geometry`);
        if (place) {
            if (place.data.status == "ZERO_RESULTS") {
                return null;
            }
            return {
                formatted_address: place.data.candidates[0].formatted_address,
                name: place.data.candidates[0].name,
                place_id: place.data.candidates[0].place_id,
                geometry: place.data.candidates[0].geometry
            };
        }
        return null;
    },
    
    getGeocodeHelper: async function(address) {
        const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&region=ca&key=${process.env.GOOGLE_PLACES_API_KEY}`);
        if (res) {
            if (res.data.status !== "OK") {
                return null;
            }
            const result = res.data.results[0];
            return {
                place_id: result.place_id,
                geometry: result.geometry
            };
        }
        return null;
    }

};