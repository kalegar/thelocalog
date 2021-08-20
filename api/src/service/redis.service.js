import "core-js/stable";
import "regenerator-runtime/runtime";

import redis from 'redis';

export const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost',
    retry_strategy: function(options) {
        if (options.error && options.error.code === "ECONNREFUSED") {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            return new Error("The server refused the connection");
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands
            // with a individual error
            return new Error("Retry time exhausted");
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error
            return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    }
});
export const redisPrefixHours = 'HRS/';
export const redisPrefixCategory = "CAT/";
export const redisPrefixNeighbourhood = "NBD/";
export const redisPrefixRequest = "REQ/";
export const redisPrefixMerchantOwner = "MOW/";
export const redisExpiryTime = 604800;
export const redisExpiryTimeDay = 86400;
export const redisExpiryTimeShort = 3600;

const suppressErrors = process.env.SUPPRESS_REDIS_ERRORS === 'yes';
if (suppressErrors) {
    console.log('WARNING: Suppressing Redis Errors.');
}

redisClient.on("error", function(error) {
    if (!suppressErrors)
        console.error(error);
});

export default {
    redisClient,
    redisPrefixHours,
    redisPrefixCategory,
    redisPrefixNeighbourhood,
    redisPrefixRequest,
    redisExpiryTime,
    redisExpiryTimeShort
}