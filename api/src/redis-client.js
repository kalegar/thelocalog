import "core-js/stable";
import "regenerator-runtime/runtime";

import redis from 'redis';

const redisClient = redis.createClient({url: process.env.REDIS_URL || 'redis://localhost'});

export default redisClient;