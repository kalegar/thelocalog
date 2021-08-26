<template>
  <v-card rounded="lg" elevation="3">
    <div v-if="canEdit" class="d-flex justify-end mr-9 mb-n9">
      <v-btn fab top right class="mt-n4 mx-2" @click="startEditing"  v-if="!editing" ><v-icon>mdi-pencil</v-icon></v-btn>
      <v-btn fab top right class="mt-n4 mx-2" @click="saveMerchant"  v-if="editing" :loading="saveMerchantLoading" :disabled="saveMerchantLoading"><v-icon>mdi-content-save</v-icon></v-btn>
      <v-btn fab top right class="mt-n4 mx-2" @click="cancelEditing" v-if="editing" :loading="saveMerchantLoading" :disabled="saveMerchantLoading"><v-icon>mdi-cancel</v-icon></v-btn>
    </div>
    <v-row class="pt-4" justify="center">
      <v-col
        class="d-flex flex-grow-1 align-center justify-space-around"
        order="last"
        order-sm="first"
        cols="12"
        sm="auto"
      >
        <div class="mx-4">
          <p v-if="!editing" class="text-h5 text-sm-h4 text-md-h3 text-lg-h2 font-weight-medium">{{ merchant.title }}</p>
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
        cols="12"
        sm="auto"
      >
        <v-img class="logo px-4" max-width="325" contain :src="'data:image/png;base64,' + logo[0].image" />
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
              class="mt-4"
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
              class="mt-4"
            ></v-checkbox>
          </div>
          <v-spacer></v-spacer>
        </v-row>
      </div>
      <v-divider
        v-if="merchant.SocialMediaLinks && merchant.SocialMediaLinks.length"
        class="my-2"
      ></v-divider>
      <social-media-links class="mb-1" :links="merchant.SocialMediaLinks" :canEdit="canEdit" :merchantId="merchant.id" v-on:save-success="$emit('save-success',$event);" v-on:save-error="$emit('save-error',$event);"/>
    </v-card-text>
  </v-card>
</template>

<script>
import SocialMediaLinks from "./SocialMediaLinks.vue";
import { MerchantService } from "../service/Merchant.service.js";

export default {
  name: "MerchantDetailCard",
  components: { SocialMediaLinks },
  props: {
    merchant: Object,
    logo: Array,
    canEdit: {
      type: Boolean,
      default: false
    },
  },
  data: function () {
    return {
      editing: false,
      saveMerchantLoading: false
    };
  },
  methods: {
    startEditing: function() {
      if (this.canEdit) {
        this.editing = true;
      }
    },
    cancelEditing: function() {
      this.editing = false;
    },
    saveMerchant: function() {
      this.saveMerchantLoading = true;
      this.$auth.getTokenSilently().then((authToken) => {
        MerchantService.saveMerchant(this.merchant.id, authToken, this.merchant)
          .then(
            (result) => {
              this.$emit('save-success',[result]);
            },
            (err) => {
              this.$emit('save-error',[err]);
            }
          )
          .then(() => {
            this.saveMerchantLoading = false;
            this.editing = false;
          });
      });
    }
  }
};
</script>

<style scoped>
</style>