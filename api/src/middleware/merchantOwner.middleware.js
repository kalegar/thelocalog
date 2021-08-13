import "core-js/stable";
import "regenerator-runtime/runtime";
import { MerchantOwnerService } from '../service/merchantowner.service.js';
import { LoggingService } from '../service/logging.service.js';

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
        LoggingService.log(err,false);
        res.status(403).json({message: 'Not Authorized.'});
    })

}