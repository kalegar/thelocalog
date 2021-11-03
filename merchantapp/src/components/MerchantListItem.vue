<template>
  <v-hover :key="merchant.title">
    <v-list-item
      :to="{
        name: 'MerchantDetail',
        params: { id: merchant.id, geoLocation: geo.location },
      }"
    >
      <v-list-item-avatar tile :size="logoSize">
        <v-img contain :src="`/api/merchants/${merchant.id}/images/logo`"/>
      </v-list-item-avatar>

      <v-list-item-content class="merchant-list-item">
        <v-list-item-title class="text-sm-h6 text-lg-h5">{{ merchant.title }}</v-list-item-title>
        <v-list-item-subtitle v-if="merchant.description" class="subtitle text-sm-subtitle-2 text-md-subtitle-1">{{
          merchant.description
        }}</v-list-item-subtitle>
        <v-list-item-subtitle v-else
          >A local shop near you!</v-list-item-subtitle
        >
      </v-list-item-content>

      <v-divider vertical class="my-4 ml-2" v-if="merchant.distance"></v-divider>

      <v-list-item-action v-if="merchant.distance" class="location">
        <v-icon :size="locationIconSize" v-text="'mdi-map-marker-outline'"></v-icon>
        <v-list-item-action-text class="text-subtitle-2 text-md-subtitle-1">
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

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
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
    }
});
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