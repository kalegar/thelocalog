<template>
  <v-card rounded="lg" elevation="3">
    <v-row class="pt-4">
      <v-col
        class="d-flex align-center justify-space-around"
        order="last"
        order-md="first"
      >
        <div class="mx-4">
          <h1 v-if="!editing">{{ merchant.title }}</h1>
          <v-text-field
            class="text-h4"
            height="40"
            v-else
            large
            v-model="merchant.title"
            label="Merchant Title"
          ></v-text-field>
        </div>
      </v-col>
      <v-col
        class="d-flex align-center justify-center"
        v-if="logo && logo.length"
      >
        <img class="logo" :src="'data:image/png;base64,' + logo[0].image" />
      </v-col>
    </v-row>
    <v-divider class="mx-4 my-4"></v-divider>
    <v-card-text class="mt-4">
      <p v-if="!editing">{{ merchant.description }}</p>
      <v-textarea
        v-else
        v-model="merchant.description"
        label="Description"
        rows="3"
      ></v-textarea>
      <div v-if="merchant.website" class="mt-4">
        <a v-if="!editing" :href="merchant.website" target="_blank">{{
          merchant.website
        }}</a>
        <v-text-field
          v-else
          class="mt-2"
          v-model="merchant.website"
          label="Website"
        ></v-text-field>
      </div>
      <div class="online-shopping mt-6">
        <v-row class="mb-4" justify="center" align="center">
          <v-spacer></v-spacer>
          <div class="mr-1 text-caption text-md-body-2 font-weight-medium">
            In-Store Shopping:
          </div>
          <div v-if="!editing" id="in-store-shopping">
            <v-icon
              color="green"
              v-if="merchant.inStoreShopping"
              :small="$vuetify.breakpoint.mobile"
              >mdi-check-circle-outline</v-icon
            >
            <v-icon color="red" v-else>mdi-close-circle-outline</v-icon>
          </div>
          <div v-else>
            <v-checkbox
              v-model="merchant.inStoreShopping"
              dense
              class="mt-n1"
            ></v-checkbox>
          </div>
          <v-spacer></v-spacer>
          <h4 class="mr-1 text-caption text-md-body-2 font-weight-medium">
            Online Shopping:
          </h4>
          <div v-if="!editing" id="online-shopping">
            <v-icon
              color="green"
              v-if="merchant.onlineShopping"
              :small="$vuetify.breakpoint.mobile"
              >mdi-check-circle-outline</v-icon
            >
            <v-icon color="red" v-else>mdi-close-circle-outline</v-icon>
          </div>
          <div v-else>
            <v-checkbox
              v-model="merchant.onlineShopping"
              dense
              class="mt-n1"
            ></v-checkbox>
          </div>
          <v-spacer></v-spacer>
        </v-row>
      </div>
      <v-divider
        v-if="merchant.SocialMediaLinks && merchant.SocialMediaLinks.length"
        class="my-2"
      ></v-divider>
      <social-media-links class="mb-1" :links="merchant.SocialMediaLinks" />
    </v-card-text>
  </v-card>
</template>

<script>
import SocialMediaLinks from "./SocialMediaLinks.vue";
export default {
  name: "MerchantDetailCard",
  components: { SocialMediaLinks },
  props: {
    merchant: Object,
    logo: Array,
    editing: Boolean,
  },
  data: function () {
    return {};
  },
};
</script>

<style scoped>
</style>