import axios from 'axios';

export const AdminService = {

    getMerchantClaims: function(authToken) {
        return new Promise((resolve,reject) => {
            const url = `/api/admin/claims`;
            axios.get(url, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            .then(res => {
                if (res.status != 200) {
                    reject(res.statusText);
                    return;
                }
                if (res.data.claims) {
                    resolve(res.data.claims);
                    return;
                }
                reject('No claims returned.');
            })
            .catch(err => {
                reject(err);
            });
        });
    },

    getMerchantClaim: function(claimId, authToken) {
        return new Promise((resolve, reject) => {
            const url = `/api/admin/claims/${claimId}`;
            axios.get(url, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            .then(res => {
                if (res.status != 200) {
                    reject(res.statusText);
                    return;
                }
                if (res.data) {
                    resolve(res.data);
                    return;
                }
                reject('No claim returned.');
            })
            .catch(err => {
                reject(err);
            });
        });
    },

    approveClaim: function(claimId, authToken) {
        return new Promise((resolve, reject) => {
            const url = `/api/admin/claims/${claimId}/accept`;
            axios.put(url,{}, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            .then(res => {
                if (res.status != 200) {
                    reject(res.statusText);
                    return;
                }
                if (res.data) {
                    resolve(res.data);
                    return;
                }
                reject('No claims returned.');
            })
            .catch(err => {
                reject(err);
            });
        });
    },

    denyClaim: function(claimId, authToken) {
        return new Promise((resolve, reject) => {
            const url = `/api/admin/claims/${claimId}/deny`;
            axios.put(url,{}, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            .then(res => {
                if (res.status != 202) {
                    reject(res.statusText);
                    return;
                }
                resolve('Success!');
            })
            .catch(err => {
                reject(err);
            });
        });
    },

    deleteMerchantSuggestion: function(suggestionID, authToken) {
        return new Promise((resolve, reject) => {
            const url = `/api/merchantsuggestions/${suggestionID}`;
            axios.delete(url, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
            })
            .then((res) => {
                if (res.status !== 200) {
                    reject('Error deleting suggestion.');
                    return;
                }
                resolve();
            })
            .catch((err) => {
                reject(err);
            })
        });
    }

};