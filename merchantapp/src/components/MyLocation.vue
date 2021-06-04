<template>
    <div class="location-div">
        <b-form-checkbox id="geo-location-switch" v-model="enabled" switch size="lg">Use My Location</b-form-checkbox>
        <div class="geo-radius" v-if="enabled">
            <label for="geo-location-radius">Radius: {{radius}} km</label>
            <b-form-input id="geo-location-radius" v-model="radius" type="range" size="lg" min="1" max="100" :disabled="!enabled"></b-form-input>
        </div>
    </div>
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
                    navigator.geolocation.getCurrentPosition(this.setGeoLocation);  
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
.location-div {
    margin-top: 1rem;
}
label {
    text-align: left;
}
.geo-radius {
    width: 60%;
}
</style>