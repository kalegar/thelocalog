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
    }

}