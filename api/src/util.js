export const Utils = {

    forceNumber: (val) => {
        let result = parseInt(val);
        return isNaN(result) ? 0 : result;
    },

    numberOrNull: (val) => { 
        let result = parseInt(val);
        return isNaN(result) ? null : result;
    },
    
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
                return "(\'" + value.map((n) => Utils.cleanString(n.toUpperCase())).join('\',\'') + "\')";
            } else if (split) {
                return "(\'" + value.split(delimiter).map((n) => Utils.cleanString(n.toUpperCase())).join('\',\'') + "\')";
            } else {
                return `(\'${Utils.cleanString(value)}\')`;
            }
        }
        return '(\'\')';
    },

    cleanString: function(value) {
        return value.replaceAll("'","\'\'");
    },

    getFullAddress: function(addrObject) {
        return addrObject.address1 && addrObject.address1.length > 0 ? addrObject.address1 + ', ' : '' +
               addrObject.address2 && addrObject.address2.length > 0 ? addrObject.address2 + ', ' : '' +
               addrObject.address3 && addrObject.address3.length > 0 ? addrObject.address3 + ', ' : '' +
               addrObject.city     && addrObject.city.length     > 0 ? addrObject.city     + ', ' : '' +
               addrObject.province && addrObject.province.length > 0 ? addrObject.province : '';
    },
    
    areAddressesEqual: function(addr1, addr2) {
        return (
               addr1.address1      === addr2.address1   &&
               addr1.address2      === addr2.address2   &&
               addr1.address3      === addr2.address3   &&
               addr1.city          === addr2.city       &&
               addr1.province      === addr2.province   &&
               addr1.country       === addr2.country    &&
               addr1.postalcode    === addr2.postalcode &&
               addr1.neighbourhood === addr2.neighbourhood
        );
    },
    
    areContactsEqual: function(cont1, cont2) {
        return (
                cont1.email      === cont2.email     &&
                cont1.email2     === cont2.email2    &&
                cont1.phone      === cont2.phone     &&
                cont1.phonetype  === cont2.phonetype &&
                cont1.phone2     === cont2.phone2    &&
                cont1.phonetype2 === cont2.phonetype2
        );
    }
}