<template>
    <!-- <div class="map" ref="map">
    </div> -->
    <iframe
    height="250"
    frameborder="0" style="border:0"
    v-bind:src="mapsURL" allowfullscreen>
    </iframe>
</template>

<script>
//import gplacesInit from '../utils/gplaces';

export default {
    name: 'GoogleMapsEmbed',
    props: {
        mapParams: String,
        mode: {
            type: String,
            default: 'place',
            validator: function(val) {
                return ['place','view','directions','streetview','search'].indexOf(val) !== -1;
            }
        }
    },
    data: function() {
        return {
            baseURL: "https://www.google.com/maps/embed/v1/"
        }
    },
    computed: {
        mapsURL: function() {
            return this.baseURL + this.mode + '?key=' + process.env.VUE_APP_GOOGLE_MAPS_EMBED_API_KEY + '&' + this.mapParams;
        }
    },
    mounted: async function() {
        console.log('MAP MOUNTED')
        // const google = await gplacesInit(process.env.VUE_APP_GOOGLE_PLACES_API_KEY);

        // let map = new google.maps.Map(this.$refs.map);

        // let request = {
        //     query: this.mapParams,
        //     fields: ['name','geometry','place_id']
        // };

        // let service = new google.maps.places.PlacesService(map);

        // service.findPlaceFromQuery(request, function(results, status) {
        //     if (status == google.maps.places.PlacesServiceStatus.OK) {
        //         for (var i = 0; i < results.length; i++) {
        //             let marker = new google.maps.Marker({
        //                 position: results[i].geometry.location,
        //                 title: results[i].name
        //             })
        //             marker.setMap(map);
        //         }
        //         map.setCenter(results[0].geometry.location);
        //         map.fitBounds(results[0].geometry.viewport);
        //         service.getDetails({
        //             placeId: results[0].place_id,
        //             fields: ['opening_hours']
        //         }, function(place, status) {
        //             if (status == google.maps.places.PlacesServiceStatus.OK) {
        //                 console.log(place);
        //             }
        //         })
        //     }
        // });
    }
}
</script>

<style scoped>
.map {
    height: 250px;
}
</style>