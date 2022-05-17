import axios from 'axios';

export const ProductService = {

    createProduct: function(authToken, merchantId, title, price, description, url, image = null) {
        const _url = `/api/products`;
        return new Promise((resolve, reject) => {
            let formData = new FormData();
            formData.append('title',title);
            formData.append('price',price);
            formData.append('description',description);
            formData.append('url',url);
            formData.append('image',image);
            formData.append('merchantId',merchantId)
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
                    return;
                }
                resolve('Created Product Successfully!');
            })
            .catch(err => {
                const msg = (err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                reject(`Error creating product: ${err}${msg}`);
            })
        });
    },

    deleteProduct: function(authToken, productId) {
        const url = `/api/products/${productId}`;
        return new Promise((resolve, reject) => {
            axios.delete(url, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authToken}`
                },
            })
            .then(res => {
                if (res.status != 200) {
                    reject(`Error deleting product: ${res.statusText} ${res.data.message}`);
                    return;
                }
                resolve('Deleted Product Successfully!');
            })
            .catch(err => {
                const msg = (err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                reject(`Error deleting product: ${err}${msg}`);
            })
        });
    },

    getProducts: function(perpage = 10, page = 1) {
        const url = `/api/products`;
        return new Promise((resolve, reject) => {
            axios.get(url, {
                params: {
                    perpage,
                    page: page-1
                }
            })
            .then(res => {
                if (res.status != 200) {
                    reject('Status != 200');
                    return;
                }
                if ('products' in res.data) {
                    if (res.data.products.count && 'rows' in res.data.products) {
                        resolve(res.data.products.rows);
                        return;
                    }
                }
                resolve([]);
            })
            .catch(err => {
                const msg = (err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                reject(`Error getting products: ${err}${msg}`);
            });
        });
    },
}