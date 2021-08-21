<template>
  <v-card class="addresscard" elevation="2">
    <google-maps-embed :mapParams="encodeAddress(merchant.title, address)" />
    <v-card-text>
      <div v-if="canEdit" class="d-flex justify-end mr-9 mb-n4">
        <v-btn fab top right class="mt-n12 mx-2" @click="startEditing"  v-if="!editing"><v-icon>mdi-pencil</v-icon></v-btn>
        <v-btn fab top right class="mt-n12 mx-2" @click="saveAddress"   v-if="editing" :loading="saveAddressLoading" :disabled="saveAddressLoading"><v-icon>mdi-content-save</v-icon></v-btn>
        <v-btn fab top right class="mt-n12 mx-2" @click="cancelEditing" v-if="editing" :loading="saveAddressLoading" :disabled="saveAddressLoading"><v-icon>mdi-cancel</v-icon></v-btn>
      </div>
      <v-container class="addressdetails fluid mt-n2">
        <div class="row d-block d-sm-flex">
          <div class="col address" align="justify-content-center">
            <h3 class="mb-2">Address:</h3>
            <div v-if="!editing">
              <p>{{ address.address1 }}</p>
              <p v-if="address.address2">
                {{ address.address2 }}
              </p>
              <p v-if="address.address3">
                {{ address.address3 }}
              </p>
              <p>
                {{ address.city }}, {{ address.province }},
                {{ address.country }}
              </p>
              <p>{{ address.postalcode }}</p>
              <p v-if="address.neighbourhood">
                Neighbourhood: {{ address.neighbourhood }}
              </p>
            </div>
            <div v-else>
              <v-text-field
                class="mt-2"
                v-model="address.address1"
                label="Address Line 1"
              ></v-text-field>
              <v-expand-transition>
                <v-text-field
                  v-if="address.address1 && address.address1.length"
                  class="mt-2"
                  v-model="address.address2"
                  label="Address Line 2"
                ></v-text-field>
              </v-expand-transition>
              <v-expand-transition>
                <v-text-field
                  v-if="address.address2 && address.address2.length"
                  class="mt-2"
                  v-model="address.address3"
                  label="Address Line 3"
                ></v-text-field>
              </v-expand-transition>
              <v-text-field
                class="mt-2"
                v-model="address.city"
                label="City"
              ></v-text-field>
              <v-select
                class="mt-2"
                v-model="address.province"
                :items="provinces"
                item-text="prov"
                item-value="abbr"
                label="Province"
              ></v-select>
              <v-text-field
                class="mt-2"
                v-model="address.country"
                maxlength="2"
                counter
                label="Country"
              ></v-text-field>
              <v-text-field
                class="mt-2"
                v-model="address.postalcode"
                maxlength="20"
                counter
                label="Postal Code"
              ></v-text-field>
              <v-text-field
                class="mt-2"
                v-model="address.neighbourhood"
                maxlength="70"
                counter
                label="Neighbourhood"
              ></v-text-field>
            </div>
          </div>
          <div class="col hours mt-3-xs" v-if="hours">
            <h3 class="mb-2">Hours:</h3>
            <p v-if="hours.status">
              {{ hours.status }}
            </p>
            <div v-if="hours.hours">
              <p class="hour" v-for="hour in hours.hours" :key="hour">
                {{ hour }}
              </p>
            </div>
          </div>
        </div>
        <v-row>
          <v-col class="contact" v-if="address.Contact">
            <h3 class="mb-2">Contact Info:</h3>
            <v-list-item v-if="address.Contact.email || editing">
              <v-list-item-content>
                <v-list-item-title v-if="!editing"
                  ><a :href="'mailto:' + address.Contact.email"
                    ><v-icon left>mdi-email</v-icon
                    >{{ address.Contact.email }}</a
                  ></v-list-item-title
                >
                <v-list-item-title v-else
                  ><v-text-field
                    class="mt-2"
                    v-model="address.Contact.email"
                    label="Email Address 1"
                    prepend-icon="mdi-email"
                  ></v-text-field
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="address.Contact.email2 || editing">
              <v-list-item-content>
                <v-list-item-title v-if="!editing"
                  ><a :href="'mailto:' + address.Contact.email2"
                    ><v-icon left>mdi-email</v-icon
                    >{{ address.Contact.email2 }}</a
                  ></v-list-item-title
                >
                <v-list-item-title v-else
                  ><v-text-field
                    class="mt-2"
                    v-model="address.Contact.email2"
                    label="Email Address 2"
                    prepend-icon="mdi-email"
                  ></v-text-field
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="address.Contact.phone || editing">
              <v-list-item-content>
                <v-list-item-title v-if="!editing"
                  ><a :href="'tel:+' + address.Contact.phone"
                    ><v-icon left>mdi-phone</v-icon
                    >{{ formatPhone(address.Contact.phone) }}</a
                  ></v-list-item-title
                >
                <v-list-item-title v-else
                  ><v-text-field
                    class="mt-2"
                    v-model="address.Contact.phone"
                    label="Phone 1"
                    prepend-icon="mdi-phone"
                  ></v-text-field
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="address.Contact.phone2 || editing">
              <v-list-item-content>
                <v-list-item-title v-if="!editing"
                  ><a :href="'tel:+' + address.Contact.phone2"
                    ><v-icon left>mdi-phone</v-icon
                    >{{ formatPhone(address.Contact.phone2) }}</a
                  ></v-list-item-title
                >
                <v-list-item-title v-else
                  ><v-text-field
                    class="mt-2"
                    v-model="address.Contact.phone2"
                    label="Phone 2"
                    prepend-icon="mdi-phone"
                  ></v-text-field
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-col>
          <v-col> </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import GoogleMapsEmbed from "./GoogleMapsEmbed.vue";
import { Utils } from "../utils/util.js";
import { MerchantService } from "../service/Merchant.service.js";

export default {
  components: { GoogleMapsEmbed },
  name: "AddressCard",
  props: {
    address: Object,
    merchant: Object,
    hours: Object,
    canEdit: Boolean,
  },
  data: function () {
    return {
      editing: false,
      saveAddressLoading: false,
      provinces: [
        { prov: "Alberta", abbr: "AB" },
        { prov: "British Columbia", abbr: "BC" },
        { prov: "Manitoba", abbr: "MB" },
        { prov: "New Brunswick", abbr: "NB" },
        { prov: "Newfoundland and Labrador", abbr: "NL" },
        { prov: "Northwest Territories", abbr: "NT" },
        { prov: "Nova Scotia", abbr: "NS" },
        { prov: "Nunavut", abbr: "NU" },
        { prov: "Ontario", abbr: "ON" },
        { prov: "Prince Edward Island", abbr: "PE" },
        { prov: "Quebec", abbr: "QC" },
        { prov: "Saskatchewan", abbr: "SK" },
        { prov: "Yukon", abbr: "YT" },
      ],
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
    saveAddress: function() {
      this.saveAddressLoading = true;
      this.$auth.getTokenSilently().then((authToken) => {
        MerchantService.saveAddress(this.merchant.id, authToken, this.address)
          .then(
            (result) => {
              this.$emit('save-success',result);
            },
            (err) => {
              this.$emit('save-error',err);
            }
          )
          .then(() => {
            this.saveAddressLoading = false;
            this.editing = false;
          });
      });
    },
    encodeAddress: function (title, address) {
      if (address.placeid) {
        return encodeURI(`q=place_id:${address.placeid}`);
      }

      const queryStr =
        "q=" +
        title +
        " " +
        address.address1 +
        (address.address2 ? " " + address.address2 : "") +
        (address.address3 ? " " + address.address3 : "") +
        (address.city ? address.city + " " : "") +
        (address.province ? address.province + " " : "") +
        (address.postalcode ? address.postalcode + " " : "");

      return encodeURI(queryStr.replace("&", "%26"));
    },
    formatPhone: function (phone) {
      const formatted = Utils.formatPhoneNumber(phone);
      return formatted ? formatted : phone;
    },
  },
};
</script>

<style scoped>
.contact {
  text-align: left;
}
.addressdetails {
  margin-top: 1rem;
}
.addresscard {
  margin-bottom: 0.5rem;
  padding-bottom: 1rem;
}
.address {
  text-align: left;
}
.hours h3 {
  text-align: left;
}
.hour {
  text-align: left;
  margin-left: 1rem;
  margin-bottom: 0;
}
.address p {
  margin-bottom: 0;
  margin-left: 1rem;
}
</style>