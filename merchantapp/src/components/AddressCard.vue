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
        <v-row class="d-block d-sm-flex">
          <v-col class="address" align="justify-content-center">
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
                v-model="address1"
                label="Address Line 1"
                color="secondary"
              ></v-text-field>
              <v-expand-transition>
                <v-text-field
                  v-if="address1 && address1.length"
                  class="mt-2"
                  v-model="address2"
                  label="Address Line 2"
                  color="secondary"
                ></v-text-field>
              </v-expand-transition>
              <v-expand-transition>
                <v-text-field
                  v-if="address2 && address2.length"
                  class="mt-2"
                  v-model="address3"
                  label="Address Line 3"
                  color="secondary"
                ></v-text-field>
              </v-expand-transition>
              <v-text-field
                class="mt-2"
                v-model="city"
                label="City"
                color="secondary"
              ></v-text-field>
              <v-select
                class="mt-2"
                v-model="province"
                :items="provinces"
                item-text="prov"
                item-value="abbr"
                label="Province"
                color="secondary"
              ></v-select>
              <v-text-field
                class="mt-2"
                v-model="country"
                maxlength="2"
                counter
                label="Country"
                color="secondary"
              ></v-text-field>
              <v-text-field
                class="mt-2"
                v-model="postalcode"
                maxlength="20"
                counter
                label="Postal Code"
                color="secondary"
              ></v-text-field>
              <v-text-field
                class="mt-2"
                v-model="neighbourhood"
                maxlength="70"
                counter
                label="Neighbourhood"
                color="secondary"
              ></v-text-field>
            </div>
          </v-col>
          <v-col class="hours mt-3-xs" v-if="hours">
            <h3 class="mb-2">Hours:</h3>
            <p v-if="hours.status">
              {{ hours.status }}
            </p>
            <div v-if="hours.hours">
              <p class="hour" v-for="hour in hours.hours" :key="hour">
                {{ hour }}
              </p>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="contact" v-if="editing || hasContactDetails">
            <h3 class="mb-2">Contact Info:</h3>
            <v-list-item v-if="editing || email">
              <v-list-item-content>
                <v-list-item-title v-if="!editing"
                  ><a :href="'mailto:' + email"
                    ><v-icon left>mdi-email</v-icon
                    >{{ email }}</a
                  ></v-list-item-title
                >
                <v-list-item-title v-else
                  ><v-text-field
                    class="mt-2"
                    v-model="email"
                    label="Email Address 1"
                    prepend-icon="mdi-email"
                    color="secondary"
                  ></v-text-field
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="editing || email2">
              <v-list-item-content>
                <v-list-item-title v-if="!editing"
                  ><a :href="'mailto:' + email2"
                    ><v-icon left>mdi-email</v-icon
                    >{{ email2 }}</a
                  ></v-list-item-title
                >
                <v-list-item-title v-else
                  ><v-text-field
                    class="mt-2"
                    v-model="email2"
                    label="Email Address 2"
                    prepend-icon="mdi-email"
                    color="secondary"
                  ></v-text-field
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="editing || phone">
              <v-list-item-content>
                <v-list-item-title v-if="!editing"
                  ><a :href="'tel:+' + phone"
                    ><v-icon left>mdi-phone</v-icon
                    >{{ formatPhone(phone) }}</a
                  ></v-list-item-title
                >
                <v-list-item-title v-else
                  ><v-text-field
                    class="mt-2"
                    v-model="phone"
                    label="Phone 1"
                    prepend-icon="mdi-phone"
                    color="secondary"
                  ></v-text-field
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="editing || phone2">
              <v-list-item-content>
                <v-list-item-title v-if="!editing"
                  ><a :href="'tel:+' + phone2"
                    ><v-icon left>mdi-phone</v-icon
                    >{{ formatPhone(phone2) }}</a
                  ></v-list-item-title
                >
                <v-list-item-title v-else
                  ><v-text-field
                    class="mt-2"
                    v-model="phone2"
                    label="Phone 2"
                    prepend-icon="mdi-phone"
                    color="secondary"
                  ></v-text-field
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-col>
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
      //editable fields:
      address1: '',
      address2: '',
      address3: '',
      city: '',
      province: '',
      postalcode: '',
      neighbourhood: '',
      country: '',
      email: null,
      email2: null,
      phone: null,
      phone2: null
    };
  },
  watch: {
    address: {
      immediate: true,
      handler: function() {
        this.copyToInternalFields();
      }
    }
  },
  computed: {
    hasContactDetails: function() {
      console.log(this.address);
      if (this.address == null)
        return false;
      return ('Contact' in this.address) && (this.address.Contact !== null) && ('email' in this.address.Contact || 'email2' in this.address.Contact || 'phone' in this.address.Contact || 'phone2' in this.address.Contact);
    }
  },
  methods: {
    copyToInternalFields: function() {
      //Address
      this.address1      = this.address.address1;
      this.address2      = this.address.address2;
      this.address3      = this.address.address3;
      this.city          = this.address.city;
      this.province      = this.address.province;
      this.postalcode    = this.address.postalcode;
      this.neighbourhood = this.address.neighbourhood;
      this.country       = this.address.country;
      //Contact
      if (this.hasContactDetails) {
        this.email  = this.address.Contact.email;
        this.email2 = this.address.Contact.email2;
        this.phone  = this.address.Contact.phone;
        this.phone2 = this.address.Contact.phone2;
      }else{
        this.email = null;
        this.email2 = null;
        this.phone = null;
        this.phone2 = null;
      }
    },
    copyToExternalFields: function() {
      //Address
      this.address.address1      = this.address1;
      this.address.address2      = this.address2;
      this.address.address3      = this.address3;
      this.address.city          = this.city;
      this.address.province      = this.province;
      this.address.postalcode    = this.postalcode;
      this.address.neighbourhood = this.neighbourhood;
      this.address.country       = this.country;
      //Contact
      if (this.email || this.email2 || this.phone || this.phone2) {
        this.address.Contact = { email: this.email, email2: this.email2, phone: this.phone, phone2: this.phone2};
      }
      // this.address.Contact.email  = this.email;
      // this.address.Contact.email2 = this.email2;
      // this.address.Contact.phone  = this.phone;
      // this.address.Contact.phone2 = this.phone2;
    },
    startEditing: function() {
      if (this.canEdit) {
        this.editing = true;
        this.copyToInternalFields();
      }
    },
    cancelEditing: function() {
      this.editing = false;
      this.copyToInternalFields();
    },
    saveAddress: function() {
      this.saveAddressLoading = true;
      this.copyToExternalFields();
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