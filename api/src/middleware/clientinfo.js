import "core-js/stable";
import "regenerator-runtime/runtime";
import logger from "../service/logger.service"

module.exports = function(req, res, next) {

    try {
        let sniff_data = {}
        sniff_data.host = req.headers && req.headers.host
        sniff_data.url = req.url
        sniff_data.method = req.method
        sniff_data.user_agent = req.headers && req.headers['user-agent']
        sniff_data.ip_address = {}

        if (req.connection && req.connection.socket && req.connection.socket.remoteAddress) {
          sniff_data.ip_address.ip = sniff_data.ip_address.socketRemoteAddress = req.connection.socket.remoteAddress
        }
        if (req.socket && req.socket.remoteAddress) {
          sniff_data.ip_address.ip = sniff_data.ip_address.remoteAddress = req.socket.remoteAddress
        }
        if (req.connection && req.connection.remoteAddress) {
          sniff_data.ip_address.ip = sniff_data.ip_address.remoteAddress = req.connection.remoteAddress
        }
        if (req.headers['x-forwarded-for']) {
          sniff_data.ip_address.ip = sniff_data.ip_address['x-forwarded-for'] = req.headers['x-forwarded-for']
        }
        logger.debug(JSON.stringify(sniff_data));

        next();

    } catch (err) {
        res.status(500).json( {'error': 'INTERNAL_SERVER_ERROR'});
    }

}