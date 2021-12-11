<template>
    <div id="map"></div>
</template>

<script>
import gmapsInit from '../utils/gmaps';

import MarkerClusterer from '@google/markerclusterer'; 

export default {
    name: 'ResultsMap',

    props: {
        coords: {
            type: Array,
            default: () => []
        },
        panTo: {
            type: Object,
            default: null
        },
        center: null
    },

    data: function() {
        return {
            map: null,
            google: null,
            infoWindow: null,
            markerClusterer: null,
            mapMarkers: [],

            darkModeMapStyles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    {
                        featureType: "administrative.locality",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "poi",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "geometry",
                        stylers: [{ color: "#263c3f" }],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#6b9a76" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry",
                        stylers: [{ color: "#38414e" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#212a37" }],
                    },
                    {
                        featureType: "road",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#9ca5b3" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry",
                        stylers: [{ color: "#746855" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#1f2835" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#f3d19c" }],
                    },
                    {
                        featureType: "transit",
                        elementType: "geometry",
                        stylers: [{ color: "#2f3948" }],
                    },
                    {
                        featureType: "transit.station",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{ color: "#17263c" }],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#515c6d" }],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.stroke",
                        stylers: [{ color: "#17263c" }],
                    },
                ]
        }
    },

    watch: {
        coords: {
            handler: function() {
                this.updateMarkers();
                if (this.map !== null && this.center == null || (this.center !== null && !('latitude' in this.center))) {
                    this.resetMapZoomAndPosition();
                }
            },
            immediate: true
        },
        center: {
            handler: function() {
                if (this.map !== null && this.center !== null && 'latitude' in this.center) {
                    this.map.setCenter({lat: this.center.latitude, lng: this.center.longitude});
                    this.map.panTo(this.map.getCenter());
                }
            },
            immediate: true
        },
        map: {
            handler: function(newVal, oldVal) {
                if (newVal !== null && oldVal == null && this.center !== null && 'latitude' in this.center) {
                    this.map.setCenter({lat: this.center.latitude, lng: this.center.longitude});
                    this.map.panTo(this.map.getCenter());
                }
            },
            immediate: true
        },
        '$vuetify.theme.dark': function() {
            if (this.map == null) return;
            if (this.$vuetify.theme.dark) {
                this.map.setOptions({styles: this.darkModeMapStyles});
            }else{
                this.map.setOptions({styles: []});
            }
        },
        panTo: {
            handler: function() {
                if (this.panTo !== null && this.map !== null) {
                    if ('zoom' in this.panTo && this.panTo.zoom !== null) {
                        this.map.setZoom(this.panTo.zoom);
                    }
                    if ('id' in this.panTo && this.panTo.id !== null) {
                        for (const marker of this.mapMarkers) {
                            if (marker.id == this.panTo.id) {
                                this.map.panTo(marker.googleMarker.getPosition());
                                this.updateInfoWindow(marker);
                                this.infoWindow.open(this.map, marker.googleMarker);
                                break;
                            }
                        }
                    }else if ('coords' in this.panTo && this.panTo.coords !== null) {
                        this.map.panTo(this.panTo.coords);
                    }
                }
            }
        }
    },

    methods: {
        resetMapZoomAndPosition: function() {
            if (this.map == null) return;
            this.map.panTo({
                        lat: 53.538833, lng: -113.497467
            });
            this.map.setZoom(11);
        },
        updateInfoWindow: function(marker) {
            const url = `#/merchants/${marker.id}`;
            const logoUrl = `/api/merchants/${marker.id}/images/logo`
            this.infoWindow.setContent(`<a href=${url} class="mapshopinfo"><p class="mapshoplabel">${marker.label}</p> <img src=${logoUrl} class="mapshoplogo"/></dav>`);
        },
        updateMarkers: function() {
            const google = this.google;
            if (this.google == null) return;

            this.mapMarkers = [];

            const markers = this.coords.filter(val => val !== null).map((coord) => {

                const googleMarker = new google.maps.Marker({
                    position: coord.location,
                    icon: { url: require('../assets/localog_icon.png'), anchor: new google.maps.Point(32, 0) },
                    label: { text: 'Shop', color: 'white' },
                    title: coord.label
                });

                const marker = {googleMarker: googleMarker, id: coord.id, label: coord.label};

                googleMarker.addListener("click", () => {
                    this.updateInfoWindow(marker);
                    this.infoWindow.open(this.map, googleMarker);
                });

                this.mapMarkers.push(marker);

                return googleMarker;
            });

            if (this.markerClusterer == null) {
                this.markerClusterer = new MarkerClusterer( this.map, markers, {
                    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                    maxZoom: 15
                });
            }else{
                this.markerClusterer.clearMarkers();
                this.markerClusterer.addMarkers(markers);
            }

            
        }
    },

    mounted: async function() {
        try {
            const google = await gmapsInit(process.env.VUE_APP_GOOGLE_MAPS_JS_API_KEY);
            this.google = google;
            
            const center =  {
                lat: 53.538833, lng: -113.497467
            }
            if (this.center !== null && 'longitude' in this.center) {
                center.lng = this.center.longitude;
                center.lat = this.center.latitude;
            }

            const mapOptions = { zoom: 11, center: center };

            if (this.$vuetify.theme.dark) {
                mapOptions.styles = this.darkModeMapStyles;
            }

            const map = new google.maps.Map(this.$el, mapOptions);
            this.map = map;
            this.infoWindow = new google.maps.InfoWindow({
                content: "",
            });

            this.updateMarkers();
            
        } catch (error) {
            console.error(error);
        }
    }
}
</script>

<style scoped>
/* Set the size of the div element that contains the map */
#map {
  height: 400px;
  /* The height is 400 pixels */
  width: 100%;
  /* The width is the width of the web page */
}

.maptext {
    color: black;
}
</style>

<style>

.mapshoplogo {
    max-width: 128px !important;
    max-height: 80px !important;
    /* margin-top: 0.5rem; */
}

.mapshoplabel {
    margin-bottom: 0.5rem !important;
}

.mapshopinfo {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

</style>