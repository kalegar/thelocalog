<template>
  <v-hover :key="merchant.title">
    <v-list-item
      :to="{
        name: 'MerchantDetail',
        params: { merchantId: merchant.id, geoLocation: geo.location },
      }"
      :color="merchant.deletedAt == null ? 'light' : 'red lighten-2'"
    >
      <v-list-item-avatar tile :size="logoSize">
        <v-img contain :src="`/api/merchants/${merchant.id}/images/logo`"/>
      </v-list-item-avatar>

      <v-list-item-content class="merchant-list-item">
        <v-list-item-title class="text-sm-h6 text-lg-h5">{{merchant.deletedAt == null ? merchant.title : merchant.title + ' - DELETED' }}</v-list-item-title>
        <v-list-item-subtitle v-if="merchant.description" class="subtitle text-sm-subtitle-2 text-md-subtitle-1">{{
          merchant.description
        }}</v-list-item-subtitle>
        <v-list-item-subtitle v-else
          >A local shop near you!</v-list-item-subtitle
        >
      </v-list-item-content>

      <v-divider vertical class="my-4 ml-2" v-if="merchant.distance || (merchant.location && merchant.location.length)"></v-divider>

      <v-list-item-action class="location" v-if="merchant.distance || (merchant.location && merchant.location.length)">
        <v-fab-transition>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn text icon @click.prevent="locationClicked" v-bind="attrs" v-on="on">
                <v-icon :size="locationIconSize" v-text="'mdi-map-marker-outline'"></v-icon>
              </v-btn>
            </template>
           <span>View On Map</span>
          </v-tooltip>
        </v-fab-transition>
        <v-list-item-action-text v-if="merchant.distance" class="text-subtitle-2 text-md-subtitle-1">
        {{
          merchant.distance >= 1000
            ? (merchant.distance / 1000).toFixed(1) + "km"
            : merchant.distance.toFixed(0) + "m"
        }}
        </v-list-item-action-text>
      </v-list-item-action>
      
    </v-list-item>
  </v-hover>
</template>

<script>
export default {
    name: 'MerchantListItem',
    props: {
        merchant: Object,
        geo: Object
    },
    computed: {
      logoSize: function() {
        switch (this.$vuetify.breakpoint.name) {
                case 'xs':
                case 'sm': return 80;
                case 'md': return 90;
                case 'lg': return 100;
                default: return 120;
        }
      },
      locationIconSize: function() {
        switch (this.$vuetify.breakpoint.name) {
                case 'xs':
                case 'sm': return 24;
                default: return 32;
        }
      }
    },
    methods: {
      locationClicked: function() {
        this.$emit('location-clicked');
      }
    }
};
</script>

<style scoped>
.merchant-list-item{
    text-align: left;
}
.location {
  align-items: center;
  align-self: center !important;
}
.subtitle {
  align-self: flex-start;
}
</style>