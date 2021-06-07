
const environment = process.env.NODE_ENV || 'development';

export const LoggingService = {

    log: function(message, debug = true) {
        if (!debug) {
            console.log(message);
        }else if (environment === 'development') {
            console.log(message);
        }
    }

};