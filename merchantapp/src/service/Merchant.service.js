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

        if ('franchise' in options && options.franchise !== '') {
            params.franchise = options.franchise;
        }

        if ('canadianOwned' in options && options.canadianOwned !== '') {
            params.canadian = options.canadianOwned;
        }

        if ('independent' in options && options.independent !== '') {
            params.independent = options.independent;
        }

        if (options.includeDeleted) {
            params.deleted = 'true';
        }

        if (options.geo && options.geo.enabled && options.geo.location) {
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
                        const error = new Error(res.statusText);
                        throw error;
                    }
                    let tempMerchants = res.data.merchants.rows;
                    if (!(process.env.VUE_APP_DISABLE_ADVERTISEMENTS) || (process.env.VUE_APP_DISABLE_ADVERTISEMENTS !== 'true')) {
                        for (let i = 4; i < tempMerchants.length; i += 7) {
                            tempMerchants.splice(i, 0, { advertisement: true });
                        }
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

    getMerchantTags: function(id,textOnly = false) {
        const url = `/api/merchants/${id}/tags`;
        return new Promise((resolve, reject) => {
            axios.get(url)
            .then((res) => {
                if (res.status != 200) {
                    reject(res.statusText);
                    return;
                }
                if (textOnly) {
                    resolve(res.data.tags.map((tag) => tag.tag));
                }else{
                    resolve(res.data.tags);
                }
            })
            .catch(err => {
                reject(err);
            })
        });
    },

    setMerchantTags: function(id, authToken, tags) {
        const url = `/api/merchants/${id}/tags/bulk`;
        return new Promise((resolve, reject) => {
            axios.put(url, { tags },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    },
                })
            .then((res) => {
                if (res.status != 202) {
                    reject(res.statusText);
                    return;
                }
                resolve(res.statusText);
            })
            .catch(err => {
                reject(err);
            })
        });
    },

    setMerchantCategories: function(id, authToken, categories) {
        const url = `/api/merchants/${id}/categories/bulk`;
        return new Promise((resolve, reject) => {
            axios.put(url, { categories },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    },
                })
            .then((res) => {
                if (res.status != 202) {
                    reject(res.statusText);
                    return;
                }
                resolve(res.statusText);
            })
            .catch(err => {
                reject(err);
            })
        });
    },

    getMerchantCategories: function(id, textOnly = false, pretty = true) {
        const url = `/api/merchants/${id}/categories`;
        return new Promise((resolve, reject) => {
            axios.get(url)
            .then((res) => {
                if (res.status != 200) {
                    reject(res.statusText);
                    return;
                }
                if (textOnly) {
                    if (pretty) {
                        resolve(
                            res.data.categories.map((cat) => cat.category)
                            .map((cat) => {
                                let words = cat.split(" ");
                                return words
                                    .map(
                                    (word) =>
                                        word[0].toUpperCase() + word.toLowerCase().substring(1)
                                    )
                                    .join(" ");
                                })
                        );
                    }else{
                        resolve(res.data.categories.map((cat) => cat.category));
                    }
                }else{
                    resolve(res.data.categories);
                }
            })
            .catch(err => {
                reject(err);
            })
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

    createProduct: function(authToken, merchantId, title, price, description, url, image = null) {
        const _url = `/api/merchants/${merchantId}/products`;
        return new Promise((resolve, reject) => {
            let formData = new FormData();
            formData.append('title',title);
            formData.append('price',price);
            formData.append('description',description);
            formData.append('url',url);
            formData.append('image',image);
            axios.post(_url, formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authToken}`
                },
            })
            .then(res => {
                if (res.status != 201) {
                    reject(`Error creating product: ${res.statusText} ${res.data.message}`);
                }
                resolve('Created Product Successfully!');
            })
            .catch(err => {
                const msg = (err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                reject(`Error creating product: ${err}${msg}`);
            })
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

    saveAddress: function(merchantId,authToken,address) {
        const url = `/api/merchants/${merchantId}/addresses/${address.id}`;
        return new Promise((resolve,reject) => {
            axios.put(url, address,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
            })
            .then(res => {
                if (res.status != 200) {
                    reject(`Error updating address: ${res.statusText} ${res.data.message}`);
                }else{
                    resolve('Address Updated! You may need to refresh to see changes.');
                }
            })
            .catch(err => {
                const msg = (err.response && err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                reject(`Error updating address: ${err}${msg}`);
            });
        });
    },

    addSocialMediaLink: function(merchantId, authToken, socialMediaLink) {
        const url = `/api/merchants/${merchantId}/socialmedia/`
        return new Promise((resolve,reject) => {
            axios.post(url, socialMediaLink,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
            })
            .then(res => {
                if (res.status != 201) {
                    reject(`Error creating social media link: ${res.statusText} ${res.data.message}`);
                }else{
                    resolve('Social Media Link Created.');
                }
            })
            .catch(err => {
                const msg = (err.response && err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                reject(`Error creating social media link: ${err}${msg}`);
            });
        });
    },

    addSocialMediaLinks: function(merchantId, authToken, socialMediaLinks) {
        if (!merchantId || !merchantId.length) {
            return Promise.reject(['Invalid merchant id.']);
        }
        if (!socialMediaLinks || !Array.isArray(socialMediaLinks)) {
            return Promise.reject(['Not an array.']);
        }
        if (socialMediaLinks.length == 0) {
            return Promise.resolve('');
        }
        return new Promise((resolve, reject) => {
            const promises = [];
            socialMediaLinks.forEach((aLink) => {promises.push(this.addSocialMediaLink(merchantId, authToken, aLink));});
            Promise.allSettled(promises).then((results) => {
                let errors = [];
                results.forEach((result) => {
                    if (result.status === "rejected") {
                        errors.push(result.reason);
                    }
                });
                if (errors.length > 0) {
                    reject(errors);
                }else {
                    resolve(`Created ${socialMediaLinks.length} social media links.`);
                }
            });
        });
    },

    saveSocialMediaLink: function(merchantId, authToken, socialMediaLink) {
        const url = `/api/merchants/${merchantId}/socialmedia/${socialMediaLink.id}`;
        return new Promise((resolve,reject) => {
            axios.put(url, socialMediaLink,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
            })
            .then(res => {
                if (res.status != 200) {
                    reject(`Error updating social media link: ${res.statusText} ${res.data.message}`);
                }else{
                    resolve('Social Media Link Updated! You may need to refresh to see changes.');
                }
            })
            .catch(err => {
                const msg = (err.response && err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                reject(`Error updating social media link: ${err}${msg}`);
            });
        });
    },

    saveSocialMediaLinks: function(merchantId, authToken, socialMediaLinks) {
        if (!merchantId || !merchantId.length) {
            return Promise.reject(['Invalid merchant id.']);
        }
        if (!socialMediaLinks || !Array.isArray(socialMediaLinks)) {
            return Promise.reject(['Not an array.']);
        }
        return new Promise((resolve, reject) => {
            const promises = [];
            socialMediaLinks.forEach((aLink) => {promises.push(this.saveSocialMediaLink(merchantId, authToken, aLink));});
            Promise.allSettled(promises).then((results) => {
                let errors = [];
                results.forEach((result) => {
                    if (result.status === "rejected") {
                        errors.push(result.reason);
                    }
                });
                if (errors.length > 0) {
                    reject(errors);
                }else {
                    resolve(`Updated ${socialMediaLinks.length} social media links.`);
                }
            });
        });
    },

    deleteSocialMediaLink: function(merchantId, authToken, socialMediaLinkId) {
        return new Promise((resolve, reject) => {
            const url = `/api/merchants/${merchantId}/socialmedia/${socialMediaLinkId}`;
            axios.delete(url,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    },
                })
                .then(res => {
                    if (res.status != 200) {
                        reject(`Error deleting social media link: ${res.statusText} ${res.data.message}`);
                    }else{
                        resolve('Social Media Link Deleted.');
                    }
                })
                .catch(err => {
                    const msg = (err.response && err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                    reject(`Error deleting social media link: ${err}${msg}`);
                });
        })
    },

    getCategories: function(pretty = true, all = false, authToken = '') {
        return new Promise((resolve, reject) => {
            const url = all ? `/api/categories/all` : `/api/categories`;
            const headers = all ? {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
            } : {};
            axios
            .get(url, headers)
            .then((res) => {
                if (res.status != 200) {
                    reject('Error retrieving categories.');
                    return;
                }
                let categories = res.data.categories
                    .map((cat) => cat.category)
                    .filter((cat) => cat !== null);
                if (pretty) {
                    categories = categories.map((cat) => {
                    let words = cat.split(" ");
                    return words
                        .map(
                        (word) =>
                            word[0].toUpperCase() + word.toLowerCase().substring(1)
                        )
                        .join(" ");
                    });
                }
                resolve(categories);
                return;
            })
            .catch((err) => {
                reject(err);
            });
        });
    },

    getMerchantsForCategory: function(category,authToken) {
        return new Promise((resolve, reject) => {
            if (category == null || !category.length) {
                reject('Null or empty category.');
                return;
            }
            const url = `/api/categories/merchants/${category}`;
            axios.get(url,{
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
            })
            .then(res => {
                if (res.status != 200) {
                    reject('Error retrieving merchants for category.');
                    return;
                }
                resolve(res.data);
            })
            .catch((err) => {
                reject(err);
            })

        });
    },

    addCategory: function(category, authToken) {
        return new Promise((resolve, reject) => {
            if (category == null || category.length == 0) {
                reject('Null or empty category');
                return;
            }
            const url = `/api/categories/${category}`;
            axios.post(url, {}, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
            })
            .then((res) => {
                if (res.status == 400) {
                    reject('Duplicate category.');
                    return;
                }
                if (res.status != 201) {
                    reject('Error adding category.');
                    return;
                }
                if (!res.data.categories) {
                    resolve([]);
                }else{
                    resolve(res.data.categories.map((cat) => {
                        let words = cat.category.split(" ");
                        return words
                            .map(
                            (word) =>
                                word[0].toUpperCase() + word.toLowerCase().substring(1)
                            )
                            .join(" ");
                        }));
                }
            })
            .catch((err) => {
                reject(err);
            });
        });
    },

    deleteCategory: function(category, authToken) {
        return new Promise((resolve, reject) => {
            if (category == null || category.length == 0) {
                reject('Null or empty category');
                return;
            }
            const url = `/api/categories/${category}`;
            axios.delete(url, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
            })
            .then((res) => {
                if (res.status == 404) {
                    reject('Category '+category+'does not exist.');
                    return;
                }
                if (res.status != 200) {
                    reject('Error deleting category.');
                    return;
                }
                resolve();
            })
            .catch((err) => {
                reject(err);
            });
        });
    },

    suggestMerchant: function(body) {
        return new Promise((resolve, reject) => {
            if (body == null) {
                reject('Null body');
                return;
            }
            const url = `/api/merchantsuggestions/`;
            axios.put(url, body)
            .then((res) => {
                if (res.status != 201) {
                    reject('Error creating suggestion.');
                    return;
                }
                resolve(res.data);
            })
            .catch((err) => {
                reject(err);
            });
        })
    },

    getMerchantSuggestions: function(authToken) {
        return new Promise((resolve, reject) => {
            const url = `/api/merchantsuggestions/`;
            axios.get(url, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
            })
            .then((res) => {
                if (res.status !== 200) {
                    reject('Error getting suggestions.');
                    return;
                }
                resolve(res.data);
            })
            .catch((err) => {
                reject(err);
            })
        });
    }

}