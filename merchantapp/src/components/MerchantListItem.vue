<template>
  <v-hover v-slot:default="{ hover }" :key="merchant.title">
    <v-list-item
      :to="{
        name: 'MerchantDetail',
        params: { id: hashedId, geoLocation: geo.location },
      }"
    >
      <div class="mt-n2" v-if="merchant.distance">
        <v-list-item-avatar class="my-0">
          <v-icon :large="hover">mdi-map-marker-outline</v-icon>
        </v-list-item-avatar>
        <v-list-item-subtitle class="mr-4 mt-n1">{{
          merchant.distance >= 1000
            ? (merchant.distance / 1000).toFixed(1) + "km"
            : merchant.distance.toFixed(0) + "m"
        }}</v-list-item-subtitle>
      </div>

      <v-divider vertical class="my-4 mr-2" v-if="merchant.distance"></v-divider>

      <v-list-item-content class="merchant-list-item">
        <h3>{{ merchant.title }}</h3>
        <v-list-item-subtitle v-if="merchant.description">{{
          merchant.description
        }}</v-list-item-subtitle>
        <v-list-item-subtitle v-else
          >A local shop near you!</v-list-item-subtitle
        >
      </v-list-item-content>

      <v-list-item-avatar tile size="80"
        ><v-img contain :src="`/api/merchants/${merchant.id}/images/logo`"
      /></v-list-item-avatar>
    </v-list-item>
  </v-hover>
</template>

<script>
import hashidsMixin from '../mixins/hashids.mixin.js';

export default {
    mixins: [hashidsMixin],
    name: 'MerchantListItem',
    props: {
        merchant: Object,
        geo: Object
    },
    computed: {
      hashedId: function() {
        if (this.merchant && this.merchant.id)
          return this.uuidToHash(this.merchant.id)
        else
          return '';
      }
    }
};
</script>

<style scoped>
.merchant-list-item{
    text-align: left;
}
</style>