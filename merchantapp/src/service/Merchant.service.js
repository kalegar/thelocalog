import axios from 'axios';

let cancelToken;

export const MerchantService = {
    /**
     * Retrieves merchants from Localog API
     * @param {search flters and other parameters} options 
     */
    getMerchants: function (options) {

        if (typeof cancelToken != typeof undefined) {
            cancelToken.cancel("Operation canceled due to new request.");
        }

        let params = {
            'details': true,
            'page': options.page,
            'perpage': options.perpage
        }

        if (options.merchantOrder) {
            params.sort = options.merchantOrder;
        }

        if (options.tags && options.tags.length > 0) {
            params.t = options.tags.join(",");
        }

        if (options.categories && options.categories.length > 0) {
            params.c = options.categories.join(",");
        }

        if (options.neighbourhood && options.neighbourhood.length > 0) {
            params.n = options.neighbourhood.join(",");
        }

        if (options.searchquery) {
            params.s = options.searchquery;
        }

        if (options.includeDeleted) {
            params.deleted = 'true';
        }

        if (options.geo && options.geo.enabled && options.geo.location) {
            console.log(options.geo);
            params.lat = options.geo.location.latitude;
            params.lon = options.geo.location.longitude;
            if (options.geo.radius) {
                params.radius = options.geo.radius * 1000;
            }
        }

        cancelToken = axios.CancelToken.source();
        return new Promise((resolve, reject) => {

            axios.get('/api/merchants', {
                params,
                cancelToken: cancelToken.token
            })
                .then(res => {
                    if (res.status != 200) {
                        console.log('ERROR');
                        const error = new Error(res.statusText);
                        throw error;
                    }
                    let tempMerchants = res.data.merchants.rows;
                    for (let i = 4; i < tempMerchants.length; i += 7) {
                        tempMerchants.splice(i, 0, { advertisement: true });
                    }
                    let result = {
                        merchants: tempMerchants,
                        page: options.page
                    };
                    result.pages = Math.ceil(res.data.merchants.count / options.perpage);
                    if (result.pages <= 1) {
                        result.page = 1;
                    } else if (result.page > result.pages) {
                        result.page = (result.pages - 1);
                    }
                    //Pass merchants + other params out through promise resolve
                    resolve(result);
                })
                .catch(err => {
                    if (axios.isCancel(err)) {
                        reject({cancelled: true});
                        return;
                    }
                    //Pass error out through reject
                    reject(err);
                });

        });
    },

    getMerchant: function(id,include = 'address,social,contact') {
        const url = `/api/merchants/${id}`;
        return new Promise((resolve,reject) => {
            axios.get(url, {
                params: {
                    'details': true,
                    'include': include
                }
            })
            .then(res => {
                if (res.status != 200) {
                    reject(res.statusText);
                    return;
                }
                resolve(res.data.merchant);
            })
            .catch(err => {
                reject(err);
            });
        });
    },

    deleteMerchant: function(id,authToken) {
        const url = `/api/merchants/${id}`;
        return new Promise((resolve,reject) => {
            axios.delete(url,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
            })
            .then(res => {
                if (res.status != 200) {
                    reject(`Error deleting merchant: ${res.statusText} ${res.data.message}`);
                } else {
                    resolve('Soft-deleted Merchant!');
                }
            })
            .catch(err => {
                const msg = (err.response && err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                reject(`Error deleting merchant: ${err}${msg}`);
            });
        });
    },

    saveMerchant: function(id,authToken,merchant) {
        const url = `/api/merchants/${id}`;
        return new Promise((resolve,reject) => {
            axios.put(url, merchant,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
            })
            .then(res => {
                if (res.status != 200) {
                    reject(`Error updating merchant: ${res.statusText} ${res.data.message}`);
                }else{
                    resolve('Merchant Updated! You may need to refresh to see changes.');
                }
            })
            .catch(err => {
                const msg = (err.response && err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                reject(`Error updating merchant: ${err}${msg}`);
            });
        });
    },

    createMerchant: function(merchant, authToken) {
        const url = `/api/merchants`;
        return new Promise((resolve, reject) => {
            axios.post(url, merchant,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            .then(res => {
                if (res.status != 201) {
                    reject(res.statusText);
                    return;
                }
                resolve(res.data);
            })
            .catch(err => {
                reject(err);
            })
        })
    },

    createAddress: function(merchantId, address, authToken) {
        const url = `/api/merchants/${merchantId}/addresses`;
        return new Promise((resolve, reject) => {
            axios.post(url, address,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                })
            .then(res => {
                if (res.status != 201) {
                    reject(res.statusText);
                    return;
                }
                resolve(res.data);
            })
            .catch(err => {
                reject(err);
            })
        })
    },

    deleteAddress: function(merchantId, addressId, authToken) {
        const url = `/api/merchants/${merchantId}/addresses/${addressId}`;
        return new Promise((resolve, reject) => {
            axios.delete(url,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            .then(res => {
                if (res.status != 200) {
                    reject(res.statusText);
                    return;
                }
                resolve('Deleted Address.');
            })
            .catch(err => {
                reject(err);
            })
        })
    },

    getLogo: function(id) {
        const url = `/api/merchants/${id}/images`;
        return new Promise((resolve,reject) => {
            axios.get(url,{ params: { type: 'LOGO' }})
            .then(res => {
                if (res.status != 200) {
                    reject(res.statusText);
                    return;
                }
                resolve(res.data);
            })
            .catch(err => {
                reject(err);
            })
        });
    },

    getBusinessHours: function(id) {
        const url = `/api/merchants/${id}/hours`;
        return new Promise((resolve,reject) => {
            axios.get(url)
            .then(res => {
                if (res.status != 200) {
                    reject(res.statusText);
                    return;
                }
                resolve(res.data.data);
            })
            .catch(err => {
                reject(err);
            });
        });
    },

    uploadLogo: function(id,authToken,logo) {
        const url = `/api/merchants/${id}/images/logo`;
        return new Promise((resolve,reject) => {
            let formData = new FormData();
            formData.append('logo',logo);
            axios.post(url, formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authToken}`
                },
            })
            .then(res => {
                if (res.status != 201) {
                    reject(`Error uploading logo: ${res.statusText} ${res.data.message}`);
                }
                resolve('Uploaded Logo Successfully!');
            })
            .catch(err => {
                const msg = (err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                reject(`Error uploading logo: ${err}${msg}`);
            });
        });
    },

}