
import "core-js/stable";
import "regenerator-runtime/runtime";

const environment = process.env.NODE_ENV || 'development';

const debug = process.env.DEBUG || 'false';

export const LoggingService = {

    log: function(message, debug = true) {
        if (!debug) {
            console.log(message);
        }else if (environment === 'development' || debug !== 'false') {
            console.log(message);
        }
    }

};