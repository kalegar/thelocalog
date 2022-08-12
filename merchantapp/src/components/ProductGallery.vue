<template>
    <v-container>
        <v-row>
            <v-col v-for="product in productsToDisplay" :key="product.id" :cols="cols">
                <product-card
                    :product="product"
                    :canDelete="canDelete"
                    v-on:delete="deleteProduct(product)"
                ></product-card>
            </v-col>
        </v-row>
        <v-row v-if="merchantId.length && internal_showAll" >
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
        <v-row v-if="productsToDisplay.length && !internal_showAll">
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
import ProductCard from './ProductCard.vue'
export default {
  components: { ProductCard },
    name: 'ProductGallery',
    props: {
        merchantId: {
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
    },
    data: () => {
        return {
            internal_products: [],
            page: 1,
            pages: 1,
            internal_perpage: 50,
            internal_showAll: false
        };
    },
    methods: {
        getProductsForMerchant: function(id) {
            if (!id.length) {
                return;
            }
            MerchantService.getProducts(id,this.internal_perpage,this.page)
            .then(res => {
                this.internal_products = res.products;
                this.pages = res.pages;
                this.page = res.page;
                this.$emit('get-products',this.internal_products);
            }, () => {
                this.internal_products = [];
            })
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