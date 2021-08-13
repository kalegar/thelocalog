import axios from 'axios';

export const UserService = {

    initUser: function(authToken) {
        return new Promise((resolve, reject) => {
            const url = `/api/users`;
            axios.get(url, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
            })
            .then(res => {
                if (res.status != 200) {
                    reject(res.statusText);
                    return;
                }
                resolve(res.statusText);
            })
            .catch(err => {
                reject(err);
            });
        });
    },

    isMerchantOwner: function(merchantId, authToken) {
        return new Promise((resolve, reject) => {
            const url = `/api/users/merchants/${merchantId}`;
            axios.get(url, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
            })
            .then(res => {
                if (res.status != 200) {
                    reject(res.statusText);
                    return;
                }
                if (Array.isArray(res.data) && res.data.length == 0) {
                    reject('Not an owner');
                    return;
                }
                resolve(res.data.merchant);
            })
            .catch(err => {
                reject(err);
            });
        });
    }

}