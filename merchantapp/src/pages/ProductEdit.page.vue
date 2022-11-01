<template>
  <div class="ProductEdit">
    <base-page>
      <base-content>
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
        <v-container>
          <v-row>
            <v-col> 
                <h1>{{pageTitle}}</h1>
                <v-img v-if="imageUrl && imageUrl.length"
                    :src="imageUrl"
                    height="200px"
                    width="200px"
                ></v-img>
                <v-form v-model="valid" ref="form">
                <v-container>
                    <v-row>
                        <v-col>
                            <v-text-field outlined class="mt-2" color="secondary" label="Product Title" v-model="title" :rules="[rules.required]" required></v-text-field>
                            <v-text-field outlined class="mt-2" color="secondary" label="Product Image URL" v-model="imageUrl"></v-text-field>
                            <v-file-input v-if="!imageUrl || !imageUrl.length" outlined class="mt-2" color="secondary" label="Product Image" v-model="image" accept="image/png" clearable prepend-inner-icon='mdi-camera' prepend-icon=''></v-file-input>
                            <v-currency-field outlined class="mt-2" color="secondary" label="Price" v-model="price" :rules="[rules.required]" required></v-currency-field>
                            <v-checkbox outlined class="mt-2" color="secondary" label="In Stock" v-model="inStock"></v-checkbox>
                            <v-text-field outlined class="mt-2" color="secondary" label="URL" v-model="url" :rules="[rules.required]" required></v-text-field>
                            <v-textarea outlined class="mt-2" color="secondary" label="Description" v-model="description"></v-textarea>
                            <v-text-field outlined class="mt-2" color="secondary" label="SKU / External ID" v-model="externalId"></v-text-field>
                            <v-row>
                                <v-btn @click="submit" color="secondary" class="mr-2" :disabled="!valid || loading">{{this.productId.length ? 'Save' : 'Submit'}}</v-btn>
                                <v-btn @click="cancel" color="danger">Cancel</v-btn>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-container>
                </v-form>
            </v-col>
          </v-row>
        </v-container>
      </base-content>
    </base-page>
  </div>
</template>

<script>
import BasePage from "./base/BasePage.page.vue";
import BaseContent from "./base/BaseContent.page.vue";
import VCurrencyField from '../components/VCurrencyField.vue';
import { MerchantService } from '../service/Merchant.service';
import { ProductService } from '../service/Product.service';
export default {
  components: {
    BasePage,
    BaseContent,
    VCurrencyField,
  },
  name: "ProductEdit",
  props: {
    productId: {type: String, default: ''},
    merchantId: {type: String, default: ''},
    merchantWebsite: {type: String, default: ''},
  },
  computed: {
      pageTitle: function() {
          return this.productId.length ? 'Edit Product' : 'New Product';
      }
  },
  watch: {
    productId: {
      immediate: true,
      handler: function() {
        this.getProduct(this.productId);
      }
    }
  },
  data: function () {
    return {
        valid: false,
        loading: false,
        rules: {
                required: value => !!value || 'Required.',
            },
        title: '',
        price: 0.0,
        description: '',
        url: this.merchantWebsite,
        image: null,
        imageUrl: '',
        inStock: true,
        externalId: '',
        snackbar: {
            color: "primary",
            show: false,
            text: "",
            timeout: 2000,
        },
    };
  },
  methods: {
      cancel: function() {
          this.title = '';
          this.price = 0.0;
          this.description = '';
          this.url = '';
          this.image = null;
          this.$refs.form.resetValidation();
          this.$router.push({ name: 'MerchantDetail', params: { merchantId: this.merchantId }});
      },
      submit: function() {
          this.$auth.getTokenSilently().then((authToken) => {
              MerchantService.createOrUpdateProduct(
                  authToken,
                  this.merchantId,
                  this.productId,
                  this.title,
                  this.price,
                  this.description,
                  this.url,
                  this.inStock,
                  this.image,
                  this.imageUrl,
                  this.externalId
              ).then((res) => {
                  // Success
                  this.makeToast(res, 'success');
                  this.loading = true;
                  setTimeout(() => {
                      this.$router.push({ name: 'MerchantDetail', params: { merchantId: this.merchantId }});
                  }, 1500);
              }, rej => {
                  this.makeToast('Failed to create product. ' + rej, 'danger');
                  console.log(rej);
              });
          });
      },
      getProduct: function() {
        if (this.productId && this.productId.length) {
          this.loading = true;
          ProductService.getProduct(this.productId).then(prod => {
            this.title = prod.title;
            this.price = Number(prod.price).toFixed(2);
            this.description = prod.description;
            this.url = prod.url;
            this.imageUrl = prod.imageUrl;
            this.inStock = prod.inStock;
            this.externalId = prod.externalId;
          })
          .finally(() => {this.loading = false;});
        }
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
  }
};
</script>