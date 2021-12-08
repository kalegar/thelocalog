import "core-js/stable";
import "regenerator-runtime/runtime";

import axios from 'axios';
import { response } from "express";
import logger from "./logger.service";


////////////////////////////////////////////////
//                                            //
//  This service is used to communicate with  //
//  the auth0 management API. Simply author-  //
//  izing users should be done with JWT       //
//  middleware on routes.                     //
//                                            //
////////////////////////////////////////////////

const auth0Url = process.env.AUTH0_URL;

let accessToken = null;

const expireAccessToken = function() {
    accessToken = null;
}

export const getAccessToken = async function() {

    if (accessToken == null) {

        const response = await axios.post(auth0Url + '/oauth/token',{
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            audience: "https://dev-5ofusaot.us.auth0.com/api/v2/",
            grant_type: "client_credentials"
        }, {
            headers: {
                'content-type': 'application/json'
            }
        });

        accessToken = response.data;

        setTimeout(expireAccessToken, 82800000);

    }

    return accessToken;

}

export const getUserMetadata = async function(id) {

    const authToken = await getAccessToken();
    const options = {
        headers: {
            Authorization: `Bearer ${authToken.access_token}`
        }
    }

    axios.get(auth0Url + `/api/v2/users/${id}?fields=app_metadata&include_fields=true`,options).then(function (response) {

        logger.debug(response.data);

        return response.data;
    }).catch(function (error) {
        if (error.response) {
            logger.error(error.response.data);
            logger.error(error.response.status);
            logger.error(error.response.headers);
        } else if (error.request) {
            logger.error(error.request);
        } else {
            logger.error(error.message);
        }
    });
};

export const updateUserProfile = async function(id,profile) {

    const authToken = await getAccessToken();
    const options = {
        headers: {
            Authorization: `Bearer ${authToken.access_token}`
        }
    }
    let response;
    await axios.patch(auth0Url + `/api/v2/users/${id}`,profile,options).then(function (res) {
        response = {status: res.status, data: res.data};
    }).catch(function(error) {
        if (error.response) {
            response = error.response;
        }else{
            logger.error(error.message);
        }
    });
    return response;

}