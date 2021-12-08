import "core-js/stable";
import "regenerator-runtime/runtime";
import { MerchantOwnerService } from '../service/merchantowner.service.js';
import logger from "../service/logger.service";

module.exports = function(req, res, next) {

    let id = null;
    if (req.params.merchantId) {
        id = req.params.merchantId;
    } else if (req.params.id) {
        id = req.params.id;
    }

    MerchantOwnerService.isUserMerchantOwner(req.user,id).then((success) => {
        if (success) {
            next();
        }else{
            res.status(403).json({message: 'Not Authorized.'});
        }
    }, (err) => {
        logger.error(err);
        res.status(403).json({message: 'Not Authorized.'});
    })

}