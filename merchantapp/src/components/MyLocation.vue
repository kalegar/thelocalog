<template>
    <v-container fluid class="location-div">
        <v-row>
            <v-col class="mt-n2">
                <v-layout justify-center align-center>
                <v-switch id="geo-location-switch" v-model="enabled" inset label="Use My Location"></v-switch>
                </v-layout>
                <div class="geo-radius" v-if="enabled">
                    <label for="geo-location-radius">Radius: {{radius}} km</label>
                    <v-slider v-model="radius" min="1" max="100" :disabled="!enabled"></v-slider>
                </div>
            </v-col>
        </v-row>
        
    </v-container>
</template>

<script>
import _debounce from 'lodash/debounce';

export default {
  name: 'MyLocation',
  data: function() {
      return {
          enabled: false,
          location: {},
          radius: 10
      }
  },
  watch: {
      enabled: function() {
            if (this.enabled) {
                if (navigator.geolocation) {  
                    navigator.geolocation.getCurrentPosition(this.setGeoLocation,this.errorGettingPosition);  
                }
            }else{
                this.location = {};
                this.emitLocation();
            }
        },
      radius: _debounce(function() {
          if (this.enabled) {
              this.emitLocation();
          }
      }, 500)  
  },
  mounted: function() {
      this.loadFromLocalStorage();
  },
  methods: {
      errorGettingPosition: function(err) {
          console.warn(`ERROR(${err.code}): ${err.message}`);
      },
      setGeoLocation : function(position) {
          this.location = position;
          this.emitLocation();
      },
      emitLocation: function() {
          this.$emit('location',{ enabled: this.enabled, position: this.location, radius: this.radius});
          this.saveToLocalStorage();
      },
      saveToLocalStorage: function() {
          localStorage.useGeoLocation = this.enabled ? 'true' : 'false';
          localStorage.geoLocation = this.location;
          localStorage.geoRadius = this.radius;
      },
      loadFromLocalStorage: function() {
          if (localStorage.useGeoLocation) {
            this.enabled = (localStorage.useGeoLocation === 'true');
          }
          if (localStorage.geoLocation) {
            this.location = localStorage.geoLocation;
          }
          if (localStorage.geoRadius) {
            this.radius = localStorage.geoRadius;
          }
      }
  }
}
</script>

<style scoped>
.geo-radius {
    width: 80%;
}
</style>