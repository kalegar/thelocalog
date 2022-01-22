<template>
    <v-container fluid class="location-div">
        <v-row>
            <v-col class="mt-n2">
                <v-layout justify-center align-center>
                <v-switch id="geo-location-switch" v-model="value" @change="updateInput" inset label="Use My Location" :loading="loading" color="secondary"></v-switch>
                </v-layout>
                <div class="geo-radius" v-if="value">
                    <label for="geo-location-radius">Radius: {{radius}} km</label>
                    <v-slider v-model="radius" @change="updateRadius" min="1" max="100" :disabled="!value" color="secondary"></v-slider>
                </div>
            </v-col>
        </v-row>
        
    </v-container>
</template>

<script>
import _debounce from 'lodash/debounce';

export default {
  name: 'MyLocation',
  model: {
      prop: 'modelValue',
      event: 'change'
  },
  props: {
    modelValue: {
      type: Boolean,
      default: true
    }
  },
  data: function() {
      return {
          value: true,
          location: {
              latitude: 0,
              longitude: 0
          },
          radius: 50,
          loading: false,
      }
  },
  watch: {
      modelValue: function() {
        this.value = this.modelValue;
        console.log('MyLocation');
        this.save();
      }
  },
  mounted: function() {
      this.loadFromLocalStorage();
      this.updateInput(false);
  },
  methods: {
      getGeoLocation : function() {
        console.log("GetGeo() " + this.value);
          if (this.value && navigator.geolocation) {  
              this.loading = true;
              navigator.geolocation.getCurrentPosition(this.setGeoLocation,this.errorGettingPosition);  
          }
      },
      errorGettingPosition: function(err) {
          console.warn(`ERROR(${err.code}): ${err.message}`);
          this.loading = false;
      },
      setGeoLocation : function(position) {
          this.loading = false;
          this.location = position.coords;
          this.updateLocation();
          this.updateRadius(false);
          this.$emit('change',this.value);
      },
      updateInput: function(store = true) {
          if (this.value) {
              this.getGeoLocation();
          }else{
            this.$emit('change',this.value);
          }
          if (store)
            this.save();
      },
      updateLocation: function(store = true) {
          this.$emit('update:location', this.location);
          if (store)
            this.save();
      },
      updateRadius: _debounce(function(store = true) {
          this.$emit('update:radius', this.radius);
          if (store)
            this.save();
      }, 500, { leading: true }),
      save: function() {
          sessionStorage.useGeoLocation = this.value ? 'true' : 'false';
          sessionStorage.geoLocation = this.location;
          sessionStorage.geoRadius = this.radius;
      },
      loadFromLocalStorage: function() {
          if (sessionStorage.useGeoLocation) {
            this.value = (sessionStorage.useGeoLocation === 'true');
          }
          if (sessionStorage.geoLocation) {
            this.location = sessionStorage.geoLocation;
          }
          if (sessionStorage.geoRadius) {
            this.radius = sessionStorage.geoRadius;
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