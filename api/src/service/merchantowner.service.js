
import "core-js/stable";
import "regenerator-runtime/runtime";
import { redisClient, redisExpiryTime, redisPrefixMerchantOwner } from '../service/redis.service.js';
import { sequelize } from '../database/models';
import { QueryTypes } from 'sequelize';

export const MerchantOwnerService = {

    isUserMerchantOwner: function(user, merchantId) {

        return new Promise( (resolve, reject) => {

            try {
                const namespace = 'https://thelocalog.com/api/roles';

                let userId = null;
            
                if (user.sub) {
                    userId = user.sub;
                }

                if (user && user[namespace]) {
                    if (user[namespace].includes('admin')) {
                        resolve(true);
                        return;
                    }
                }
            
                if (merchantId !== null && userId !== null) {
                    redisClient.get(`${redisPrefixMerchantOwner}${userId}`, (err, reply) => {
                        if (err || !reply) {
                            const sql = 
                            "SELECT m.id " +
                            "FROM \"Merchants\" m "+
                            "JOIN \"MerchantOwners\" mo ON mo.\"MerchantId\" = m.id " +
                            "WHERE mo.\"UserId\" = :userId";
            
                            sequelize.query(sql,
                            {
                                replacements: {
                                    userId
                                },
                                type: QueryTypes.SELECT
                            }).then(merchants => {
                                let newArray = [];
                                let found = false;
                                if (Array.isArray(merchants)) {
                                    for (const merchant of merchants) {
                                        if (!found && merchant.id === merchantId) {
                                            found = true;
                                        }
                                        newArray.push(merchant.id);
                                    }
                                }
                                redisClient.setex(`${redisPrefixMerchantOwner}${userId}`,redisExpiryTime,JSON.stringify(newArray));
                                resolve(found);
                            }).catch(err => {
                                console.log('ERROR OCCURRED');
                                console.log(err);
                                resolve(false);
                            });
                            return;
                        }
                        const merchants = JSON.parse(reply);
                        if (Array.isArray(merchants) && merchants.includes(merchantId)) {
                            resolve(true);
                        }else{
                            resolve(false);
                        }
                    }); 
                    return;
                }
            
                resolve(false);
            } catch (err) {
                console.log(err);
                reject(err);
            }
        });
    
    }

};