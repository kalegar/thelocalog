import "core-js/stable";
import "regenerator-runtime/runtime";

module.exports = function(req, res, next) {

    const namespace = 'https://thelocalog.com/api/roles';

    if (req.user && req.user[namespace]) {
        if (req.user[namespace].includes('admin')) {
            next();
            return;
        }
    }

    res.status(403).json({message: 'Not Authorized.'});

}