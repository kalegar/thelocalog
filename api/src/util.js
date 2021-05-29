export const Utils = {
    
    clamp: (num, min, max) => {return Math.min(Math.max(num, min), max)},

    getQueryFromAddress: function(title,address) {
        return (title+' '+address.address1 + 
                    (address.address2 ? ' ' + address.address2 : '') +
                    (address.address3 ? ' ' + address.address3 : '') +
                    (address.city ? ' ' + address.city: '') +
                    (address.province ? ' ' + address.province: '') +
                    (address.postalcode ? ' ' + address.postalcode: '')
        ).replace('#','');
    }
}