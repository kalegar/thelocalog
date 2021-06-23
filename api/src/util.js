export const Utils = {
    
    clamp: (num, min, max) => {return Math.min(Math.max(num, min), max)},

    getQueryFromAddress: function(title,address) {
        return ((title ? title+' ' : '')+address.address1 + 
                    (address.address2 ? ' ' + address.address2 : '') +
                    (address.address3 ? ' ' + address.address3 : '') +
                    (address.city ? ' ' + address.city: '') +
                    (address.province ? ' ' + address.province: '') +
                    (address.postalcode ? ' ' + address.postalcode: '')
        ).replace('#','').replace("'","");
    },

    createGeom: function(lng,lat) {
        //Need to specify SRID for compat with PostGIS < 3.0.0
        return { type: 'Point', coordinates: [lng,lat], crs: { type: 'name', properties: { name: 'EPSG:4326'} }};
    },

    toListSQL: function(value,split=true,delimiter=',') {
        if (value) {
            if (Array.isArray(value)) {
                return "(\'" + value.map((n) => n.toUpperCase()).join('\',\'') + "\')";
            } else if (split) {
                return "(\'" + value.split(delimiter).map((n) => n.toUpperCase()).join('\',\'') + "\')";
            } else {
                return `(\'${value}\')`;
            }
        }
        return '(\'\')';
    }
}