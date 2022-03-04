import "core-js/stable";
import "regenerator-runtime/runtime";
import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';

module.exports = jwt({

    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://dev-5ofusaot.us.auth0.com/.well-known/jwks.json`
    }),

    audience: 'https://thelocalog.com/api',
    issuer: [`https://login.localog.ca/`],
    algorithms: ['RS256']
});