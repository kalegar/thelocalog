<template>
    <v-container>
        <v-row v-if="header" no-gutters>
            <h2>{{title}}</h2>
            <v-btn
            fab
            small
            class = "ml-3"
            v-if="canAdd"
            :to="{ name: 'ProductNew', params: { merchantId, merchantWebsite } }"
            ><v-icon>mdi-plus</v-icon></v-btn>
            <v-spacer></v-spacer>
            <v-responsive min-width="40" :max-width="500" class="mx-n2 pa-1">
                <v-text-field
                dense
                hide-details
                rounded
                solo
                clearable
                label="Search Products"
                v-bind:append-icon="(searchQuery && searchQuery.length > 0) ? '' : 'mdi-magnify'"
                v-model="searchQuery"
                @input="search"
                @click:append="search()"
                >
                </v-text-field>
            </v-responsive>
            <v-spacer></v-spacer>
            <v-autocomplete
                v-if="categories && categories.length"
                v-model="filterCategories"
                :items="categories"
                rounded
                solo
                multiple
                clearable
                dense
                label="Product Categories"
            ></v-autocomplete>
        </v-row>
        <v-row v-if="loading" class="ma-4">
            <v-progress-linear indeterminate></v-progress-linear>
        </v-row>
        <v-row v-if="loading==false">
            <v-col v-for="product in productsToDisplay" :key="product.id" :cols="cols">
                <product-card
                    :product="product"
                    :canDelete="canDelete"
                    v-on:delete="deleteProduct(product)"
                ></product-card>
            </v-col>
        </v-row>
        <v-row v-if="merchantId.length && internal_showAll && !loading" >
            <v-fade-transition name="fade" mode="out-in">
                <v-row v-if="internal_products.length" key="footer" no-gutters>
                    <v-col class="align-self-center mx-n4" align="center">
                        <v-pagination
                            v-model="page"
                            :length="pages"
                            :total-visible="paginationNumVisible"
                            circle
                        ></v-pagination>
                    </v-col>
                </v-row>
            </v-fade-transition>
        </v-row>
        <v-row v-if="productsToDisplay.length && !internal_showAll && !loading">
            <v-col>
                <v-btn
                    color="primary"
                    @click="internal_showAll = !internal_showAll"
                >Show {{ internal_showAll ? "Less" : "More" }}</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { MerchantService } from '../service/Merchant.service';
import { ProductService } from '../service/Product.service';
import ProductCard from './ProductCard.vue';
import _debounce from 'lodash/debounce';
export default {
  components: { ProductCard },
    name: 'ProductGallery',
    props: {
        merchantId: {
            type: String,
            default: ''
        },
        merchantWebsite: {
            type: String,
            default: ''
        },
        products: {
            type: Array,
            default: () => []
        },
        cols: {
            type: Number,
            default: 4
        },
        canDelete: {
            type: Boolean,
            default: false
        },
        perpage: {
            type: Number,
            default: 50
        },
        title: {
            type: String,
            default: 'Products'
        },
        header: {
            type: Boolean,
            default: true
        },
        canAdd: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        paginationNumVisible: function() {
            switch (this.$vuetify.breakpoint.name) {
                case 'xs': return 5;
                case 'sm': return 7;
                case 'md': return 8;
                default: return 10;
            }
        },
        productsToDisplay: function() {
            return this.internal_showAll ? this.internal_products : this.internal_products.slice(0,3);
        }
    },
    watch: {
        products: {
            immediate: true,
            handler: function () {
                this.internal_products = this.products;
            }
        },
        merchantId: {
            immediate: true,
            handler: function () {
                this.getProductsForMerchant(this.merchantId);
                this.getProductCategories(this.merchantId);
            }
        },
        page: function() {
            this.getProductsForMerchant(this.merchantId);
        },
        perpage: {
            immediate: true,
            handler: function() {
                this.internal_perpage = this.perpage;
                this.getProductsForMerchant(this.merchantId);
            }
        },
        filterCategories: function() {
            this.search();
        }
    },
    data: () => {
        return {
            internal_products: [],
            page: 1,
            pages: 1,
            internal_perpage: 50,
            internal_showAll: false,
            searchQuery: '',
            loading: false,
            categories: [],
            filterCategories: []
        };
    },
    methods: {
        search: function() {
            this.loading = true;
            this.internal_search();
        },
        getProductCategories: function(merchantId) {
            MerchantService.getMerchantProductCategories(merchantId,true,true).then(res => {
                this.categories = res;
            })
        },
        internal_search: _debounce(function() {
            this.internal_showAll = true;
            this.getProductsForMerchant(this.merchantId);
        }, 500),
        getProductsForMerchant: function(id) {
            if (!id.length) {
                this.loading = false;
                return;
            }
            this.loading = true;
            MerchantService.getProducts(id,this.internal_perpage,this.page,this.searchQuery,this.filterCategories)
            .then(res => {
                this.internal_products = res.products;
                this.pages = res.pages;
                this.page = res.page;
                this.$emit('get-products',{products: this.internal_products, searchQuery: this.searchQuery});
            }, () => {
                this.internal_products = [];
            }).finally(() => {this.loading = false;})
        },
        deleteProduct: function(product) {
            this.$auth.getTokenSilently().then((authToken) => {
                ProductService.deleteProduct(authToken,product.id)
                .then(() => {
                    this.getProductsForMerchant(this.merchantId);
                }, (rej) => {
                    console.log(rej);
                });
            });
        },
    }
}
</script>