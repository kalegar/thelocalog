<template>
  <div class="MerchantDetail">
    <BasePage>
      <BaseContent>
        <template v-slot:left v-if="!loading && merchant">
          <div class="mt-6 sidebar">
            <v-container>
            <v-row class="mx-1" no-gutters>
              <v-col>
              <v-btn
                class="ma-1"
                color="secondary"
                dark
                block
                v-on:click="goBack"
              >Go Back</v-btn>
              </v-col>
            </v-row>
            <v-row v-if="isAdminOrOwner">
              <v-col>
            <h4 v-if="isAdmin">Admin Tools</h4>
            <h4 v-else>Owner Tools</h4>
            <v-btn
              class="ma-1"
              v-if="!merchant.deletedAt"
              color="danger"
              dark
              :loading="deleteMerchantLoading"
              v-on:click="deleteMerchant()"
              >Delete<v-icon right dark>mdi-delete</v-icon></v-btn
            >
            <v-btn
              class="ma-1"
              v-else
              color="success"
              :loading="saveMerchantLoading"
              v-on:click="
                merchant.deletedAt = null;
                saveMerchant();
              "
              >Restore<v-icon right dark>mdi-restore</v-icon></v-btn
            >
            <v-dialog v-model="dialog.show" persistent max-width="290">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  color="secondary"
                  @click="showUploadDialog()"
                  :loading="uploadLogoLoading"
                  >Upload Logo</v-btn
                >
              </template>
              <v-card>
                <v-card-title class="text-h5">
                  {{ dialog.title }}
                </v-card-title>
                <v-card-text>
                  {{ dialog.text }}
                </v-card-text>
                <v-divider class="mx-4"></v-divider>
                <v-card-text>
                  <v-file-input
                    accept="image/png"
                    label="Upload Logo"
                    dense
                    v-model="uploadedLogo"
                  ></v-file-input>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="red darken-1"
                    text
                    @click="dialog.show = false"
                    >{{ dialog.notext }}</v-btn
                  >
                  <v-btn
                    color="green darken-1"
                    text
                    @click="
                      dialog.show = false;
                      dialog.action();
                    "
                    >{{ dialog.yestext }}</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
              </v-col>
            </v-row>
            </v-container>
          </div>
        </template>
        <v-snackbar
          v-model="snackbar.show"
          :color="snackbar.color"
          :timeout="snackbar.timeout"
        >
          {{ snackbar.text }}
          <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="snackbar.show = false">
              Close
            </v-btn>
          </template>
        </v-snackbar>
        <transition name="fade" mode="out-in">
          <div
            class="merchant container"
            key="merchant"
          >
            <v-row>
              <v-col>
                <merchant-detail-card :merchant="merchant" :logo="logo" :canEdit="isAdminOrOwner" :loading="loading" v-on:save-success="merchantSaved(true,$event)" v-on:save-error="merchantSaved(false,$event)"></merchant-detail-card>
              </v-col>
            </v-row>
            <v-row v-if="isAdminOrOwner">
              <v-col>
                <merchant-categories-tags :merchantId="merchantId" :canEdit="isAdminOrOwner"></merchant-categories-tags>
              </v-col>
            </v-row>
            <div class="addresses row" v-if="merchant && merchant.Addresses">
              <div class="col">
                <create-address-modal
                  v-if="isAdminOrOwner"
                  :merchantId="merchant.id"
                  @created="
                    makeToast('Address Created.', 'success', 2000);
                    getMerchant();
                  "
                  @error="makeToast('Error creating address.', 'danger', 3000)"
                ></create-address-modal>
                <h2 v-if="merchant.Addresses.length > 1">
                  {{ merchant.Addresses.length }} Locations
                </h2>
                <h2 v-if="merchant.Addresses.length == 1">Location</h2>
                <v-expansion-panels
                  v-model="selectedAddress"
                  multiple
                  class="mt-2"
                >
                  <v-expansion-panel
                    v-for="(address, index) in merchant.Addresses"
                    :key="address.id"
                  >
                    <v-expansion-panel-header>
                      <template v-slot:default="{ open, hover }">
                        <div class="address-header">
                          <v-icon
                            left
                            :color="open ? 'primary' : ''"
                            :large="hover || open"
                            >mdi-map-marker-outline</v-icon
                          >
                          <p :class="open ? 'my-auto bold' : 'my-auto'">
                            {{ address.address1 }}, {{ address.city }},
                            {{ address.province }}
                          </p>
                        </div>
                      </template>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="mx-n4">
                      <v-row v-if="isAdminOrOwner" class="mb-2">
                        <v-dialog
                          max-width="600"
                          transition="dialog-bottom-transition"
                          v-model="deleteAddressDialog"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              color="danger"
                              dark
                              small
                              right
                              :loading="deleteAddressLoading"
                              v-bind="attrs"
                              v-on="on"
                              class="ml-8 mt-4"
                              >Delete<v-icon right dark
                                >mdi-delete</v-icon
                              ></v-btn
                            >
                          </template>
                          <v-card>
                            <v-card-title class="text-h5"
                              >Delete Location</v-card-title
                            >
                            <v-card-text
                              >Are you sure you want to delete this location?
                              This cannot be undone.</v-card-text
                            >
                            <v-divider></v-divider>
                            <v-card-actions>
                              <v-spacer></v-spacer>
                              <v-btn
                                color="secondary"
                                text
                                @click="deleteAddressDialog = false"
                              >
                                Cancel
                              </v-btn>
                              <v-btn
                                color="red"
                                text
                                @click="
                                  deleteAddress(address.id);
                                  deleteAddressDialog = false;
                                "
                              >
                                <v-icon left>mdi-delete</v-icon>
                                Delete
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>
                      </v-row>
                      <address-card :merchant="merchant" :address="address" :hours="hours[index]" :canEdit="isAdminOrOwner" v-on:save-success="merchantSaved(true,$event)" v-on:save-error="merchantSaved(false,$event)"></address-card>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
            </div>
            <v-container>
            <v-row v-if="merchant && hasProducts">
              <v-col>
                <!-- <v-row no-gutters>
                  <h2>Products</h2>
                  <v-btn
                    fab
                    small
                    class = "ml-3"
                    v-if="isAdmin"
                    :to="{ name: 'ProductNew', params: { merchantId: merchant.id, merchantWebsite: merchant.website } }"
                  ><v-icon>mdi-plus</v-icon></v-btn>
                </v-row> -->
                <product-gallery :canAdd="isAdminOrOwner" :merchantId="merchant.id" :merchantWebsite="merchant.website" :canDelete="isAdminOrOwner" :cols="merchantCardCols" :perpage="productsPerPage" v-on:get-products="onGetProducts($event)"></product-gallery>
              </v-col>
            </v-row>
            </v-container>
            <v-row v-if="relatedMerchants.length">
              <v-col>
                <h2>Similar Shops</h2>
                <v-row>
                  <v-col v-for="merchant in someRelatedMerchants" :key="merchant.id" class="mcard-columns" :cols="merchantCardCols">
                    <merchant-card :merchant="merchant" @click="similarMerchantClicked(merchant)"></merchant-card>
                  </v-col>
                </v-row>
                <v-row no-gutters class="my-4">
                  <v-col>
                    <v-btn
                      color="primary"
                      @click="showAllRelatedMerchants = !showAllRelatedMerchants;"
                    >Show {{showAllRelatedMerchants ? "Less" : "More"}}</v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="merchant-footer align-items-center">
              <v-col>
                <p v-if="!isOwner && merchant">
                  Do you own this business? Click
                  <router-link
                    class="claim-link"
                    :to="{ name: 'MerchantClaim', params: { id: merchant.id } }"
                    >here</router-link
                  >
                  to claim it.
                </p>
                <p v-if="pageViewers > 1">
                  {{pageViewers - 1}} others are viewing this page.
                </p>
              </v-col>
            </v-row>
          </div>
        </transition>
        <div v-if="loading" class="w-100 d-flex justify-content-center align-items-center">
            <div class="loading spinner-border text-primary">
            </div>
        </div>
      </BaseContent>
    </BasePage>
  </div>
</template>

<script>
import BasePage from "./base/BasePage.page.vue";
import BaseContent from "./base/BaseContent.page.vue";
import { MerchantService } from "../service/Merchant.service";
import CreateAddressModal from "../components/CreateAddressModal.vue";
import { UserService } from "../service/User.service";
import AddressCard from '../components/AddressCard.vue';
import MerchantDetailCard from '../components/MerchantDetailCard.vue';
import MerchantCategoriesTags from '../components/MerchantCategoriesTags.vue';
import MerchantCard from '../components/MerchantCard.vue';
import ProductGallery from '../components/ProductGallery.vue';

export default {
  name: "MerchantDetail",
  props: {
    merchantId: String,
    geoLocation: Object,
  },
  components: {
    BasePage,
    BaseContent,
    CreateAddressModal,
    AddressCard,
    MerchantDetailCard,
    MerchantCategoriesTags,
    MerchantCard,
    ProductGallery
  },
  computed: {
    isAdmin: function () {
      return (
        this.$auth.isAuthenticated &&
        this.$auth.user[this.$auth.rolesKey] &&
        this.$auth.user[this.$auth.rolesKey].includes("admin")
      );
    },
    isAdminOrOwner: function () {
      return this.$auth.isAuthenticated && (this.isAdmin || this.isOwner);
    },
    hasHistory: function() {
      return window.history.length > 2;
    },
    merchantCardCols: function() {
        if (this.$vuetify.breakpoint.width < 700) {
            return 12;
        }else if (this.$vuetify.breakpoint.width < 1264) {
            return 6;
        }else if (this.$vuetify.breakpoint.width < 2300) {
            return 4;
        }else {
            return 3;
        }
    },
    productsPerPage: function() {
        if (this.$vuetify.breakpoint.width < 700) {
          return 24;
        } else {
          return 50;
        }
    },
    someRelatedMerchants: function() {
      return this.showAllRelatedMerchants ? this.relatedMerchants : this.relatedMerchants.slice(0, 3);
    }
  },
  data: function () {
    return {
      merchant: null,
      isOwner: false,
      loading: false,
      hours: [],
      logo: [],
      error: null,
      deleteMerchantLoading: false,
      saveMerchantLoading: false,
      uploadLogoLoading: false,
      uploadedLogo: null,
      snackbar: {
        color: "primary",
        show: false,
        text: "",
        timeout: 2000,
      },
      dialog: {
        show: false,
        title: "",
        text: "",
        notext: "",
        yestext: "",
        action: null,
      },
      selectedAddress: [0],
      deleteAddressDialog: false,
      deleteAddressLoading: false,
      pageViewers: 1,
      relatedMerchants: [],
      showAllRelatedMerchants: false,
      hasProducts: true,
    };
  },
  methods: {
    onGetProducts: function(event) {
      this.hasProducts = event.products.length > 0 || (event.searchQuery != null);
    },
    goBack: function() {
      if (this.hasHistory) {
        this.$router.go(-1);
      }else{
        this.$router.push('/');
      }
      this.refreshPage();
    },
    refreshPage: function() {
      let self = this;
      setTimeout(() => {
        self.relatedMerchants = [];
        self.getMerchant(true);
      },100);
    },
    getIsOwner: function () {
      this.$auth.getTokenSilently().then((authToken) => {
        UserService.isMerchantOwner(this.merchant.id, authToken).then(
          () => {
            this.isOwner = true;
          },
          () => {
            this.isOwner = false;
          }
        );
      }).catch(() => {});
    },
    showUploadDialog: function () {
      this.uploadedLogo = null;
      this.uploadedLogoMerchantId = "";
      this.dialog.title = "Upload Logo";
      this.dialog.text = `Upload a png file to set as ${this.merchant.title}'s logo.`;
      this.dialog.yestext = "Upload";
      this.dialog.notext = "Cancel";
      this.dialog.action = this.uploadLogo;
      this.dialog.show = true;
    },
    uploadLogo: function () {
      this.uploadLogoLoading = true;
      this.$auth.getTokenSilently().then((authToken) => {
        MerchantService.uploadLogo(this.merchantId, authToken, this.uploadedLogo)
          .then(
            (result) => {
              this.makeToast(result, "success");
            },
            (err) => {
              this.makeToast(err, "danger", 5000);
            }
          )
          .then(() => {
            this.uploadLogoLoading = false;
          });
      });
    },
    getBusinessHours: function () {
      MerchantService.getBusinessHours(this.merchantId).then(
        (result) => {
          if (result) {
            for (const address of this.merchant.Addresses) {
              const hours = result.filter((e) => e.address_id == address.id);
              if (hours.length > 0) {
                let business_status = "";
                switch (hours[0].status) {
                  case "OPERATIONAL":
                    business_status = "";
                    break;
                  case "CLOSED_TEMPORARILY":
                    business_status = "Closed Temporarily";
                    break;
                  case "CLOSED_PERMANENTLY":
                    business_status = "Closed Permanently";
                    break;
                  case "NO_INFO":
                    business_status = "Not Available";
                    break;
                }
                this.hours.push({
                  status: business_status,
                  hours: hours[0].hours,
                });
              }
            }
          }
        },
        (err) => {
          console.log(err);
        }
      );
    },
    getLogo: function () {
      MerchantService.getLogo(this.merchantId).then(
        (result) => {
          this.logo = result;
        },
        () => {
          console.log("Error retrieving logo");
        }
      );
    },
    merchantSaved: function(success,result) {
      if (success) {
        this.makeToast(result, 'success', 5000);
      }else{
        this.makeToast(result, "danger", 7000);
      }
      this.getMerchant();
    },
    saveMerchant: function () {
      this.saveMerchantLoading = true;
      this.$auth.getTokenSilently().then((authToken) => {
        MerchantService.saveMerchant(this.merchantId, authToken, this.merchant)
          .then(
            (result) => {
              this.makeToast(result, "success", 5000);
            },
            (err) => {
              this.makeToast(err, "danger", 5000);
            }
          )
          .then(() => {
            this.saveMerchantLoading = false;
            this.getMerchant();
          });
      });
    },
    deleteMerchant: function () {
      this.deleteMerchantLoading = true;
      this.$auth.getTokenSilently().then((authToken) => {
        MerchantService.deleteMerchant(this.merchantId, authToken)
          .then(
            (result) => {
              this.makeToast(result, "success");
              this.getMerchant();
            },
            (err) => {
              this.makeToast(err, "danger");
            }
          )
          .then(() => {
            this.deleteMerchantLoading = false;
          });
      });
    },
    deleteAddress: function (id) {
      this.deleteAddressLoading = true;
      this.$auth.getTokenSilently().then((authToken) => {
        MerchantService.deleteAddress(this.merchantId, id, authToken)
          .then(
            (result) => {
              this.makeToast(result, "success");
              this.getMerchant();
            },
            (err) => {
              this.makeToast(err, "danger");
            }
          )
          .then(() => {
            this.deleteAddressLoading = false;
          });
      });
    },
    makeToast: function (text, color, timeout = 2000) {
      let txt = '';
      if (Array.isArray(text)) {
        txt = text.join(" ");
      }else{
        txt = text;
      }
      this.snackbar.timeout = timeout;
      this.snackbar.color = color;
      this.snackbar.text = txt;
      this.snackbar.show = true;
    },
    getMerchant: function (scrollToTop = false) {
      this.loading = true;
      this.merchant = null;
      MerchantService.getMerchant(this.merchantId)
        .then(
          (result) => {
            this.merchant = result;
            this.getBusinessHours();
            this.getLogo();
            this.getRelatedMerchants();
          },
          (err) => {
            this.error = err;
            if (err.json) {
              return err.json.then((json) => {
                this.error.message = json.message;
              });
            }
          }
        )
        .finally(() => {
          this.loading = false;
          if (scrollToTop) {
            window.scrollTo(0,0);
          }
        });
    },
    getRelatedMerchants: function() {
      MerchantService.getRelatedMerchants(this.merchantId)
        .then(
          (result) => {
            this.relatedMerchants = result.merchants.rows;
          },
          (err) => {
            console.log(err);
          }
        );
    },
    similarMerchantClicked: function(merchant) {
      this.$router.push({
        name: 'MerchantDetail',
        params: { merchantId: merchant.id, geoLocation: this.geoLocation },
      });
      this.refreshPage();
    }
  },
  updated: function () {
    document.title =
      this.merchant && this.merchant.title
        ? this.merchant.title + " - The Localog"
        : "Local Shop - The Localog";
  },
  mounted: function () {
    this.getMerchant();
    const self = this;
    let auth = this.$auth;
    let interv = setInterval(function () {
      if (!auth.loading) {
        self.getIsOwner();
        clearInterval(interv);
      }
    }, 1000);
    this.$socket.client.emit('view-merchant', { merchantId: this.merchantId });
  },
  sockets: {
      currentViewers: function(data) {
        if ('viewers' in data) {
          this.pageViewers = data.viewers;
        }
      }
  }
};
</script>

<style scoped>
h2 {
  text-align: left;
}
.addresses {
  margin-top: 16px;
}
.merchant {
  margin-top: 24px;
}
.social-media-links {
  margin-top: 1rem;
}
.logo {
  max-width: 12rem;
  max-height: 12rem;
}
@media (min-width: 650px) {
  .title {
    margin-top: 0.5rem;
  }
}
.title {
  margin-bottom: 0.5rem;
  margin-left: auto;
}
.bold {
  font-weight: bold;
}
.address-header {
  display: flex;
  align-content: center;
  flex-direction: row;
  text-align: left;
  overflow: hidden;
  margin-left: -0.75rem;
}

.address-header p {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.claim-link {
  font-weight: bold;
}
.loading {
  display: inline-block;
  width: 1rem;
  height: 1rem;
}
</style>