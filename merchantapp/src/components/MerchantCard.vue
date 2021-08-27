<template>
  <v-hover v-slot:default="{ hover }">
    <v-card
      max-width="400"
      outlined
      dense
      shaped
      :elevation="hover ? 12 : 4"
      :to="{
        name: 'MerchantDetail',
        params: { id: merchant.id, geoLocation: geo.location },
      }"
    >
      <v-list-item three-line class="mb-n2">
        <v-list-item-content>
          <div class="text-h6 font-weight-bold">{{ merchant.title }}</div>
        </v-list-item-content>

        <v-list-item-avatar tile size="100"
          ><v-img contain :src="`/api/merchants/${merchant.id}/images/logo`"
        /></v-list-item-avatar>
      </v-list-item>

      <v-divider class="mx-4"></v-divider>

      <v-list-item three-line class="my-n3">
        <v-list-item-subtitle v-if="merchant.description">{{
          merchant.description
        }}</v-list-item-subtitle>
        <v-list-item-subtitle v-else
          >A local shop near you!</v-list-item-subtitle
        >
      </v-list-item>

      <v-divider class="mx-4"></v-divider>

      <div class="d-flex" style="height: 24px">
        <v-spacer></v-spacer>
        <v-list-item class="my-n1" style="width: 50%; max-width: 50%">
          <v-list-item-subtitle v-if="merchant.distance"
            ><v-icon>mdi-map-marker-outline</v-icon> Distance:
            {{
              merchant.distance >= 1000
                ? (merchant.distance / 1000).toFixed(1) + "km"
                : merchant.distance.toFixed(0) + "m"
            }}</v-list-item-subtitle
          >
        </v-list-item>
      </div>
      <v-card-actions> </v-card-actions>
    </v-card>
  </v-hover>
</template>

<script>
export default {
  name: "MerchantCard",
  props: {
      merchant: Object,
      geo: Object
  }
};
</script>

