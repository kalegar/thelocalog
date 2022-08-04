<template>
    <div class="product-card">
        <v-card v-if="product" :href="product.url" target="_blank">
            <v-img v-if="imageUrl.length"
                :src="imageUrl"
                height="200px"
            ></v-img>
            <v-sheet
                v-else
                height="200px"
                color="primary"
            >
                <v-container fill-height fluid>
                <v-row align="center" justify="center">
                <v-col>
                <v-icon color="white" x-large >mdi-tag-outline</v-icon>
                </v-col>
                </v-row>
                </v-container>
            </v-sheet>

            <v-card-title class="text-body-2 font-weight-bold">{{product.title}}</v-card-title>
            <v-card-subtitle class="product-price">{{productSubtitle}}</v-card-subtitle>
            <v-card-actions v-if="canDelete">
                <v-spacer></v-spacer>
                <v-btn
                    fab
                    icon
                    color="danger"
                    small
                    @click="onDeletePressed"
                ><v-icon>mdi-delete</v-icon></v-btn>
            </v-card-actions>
        </v-card>
        <v-skeleton-loader v-else type="card-avatar, actions">
        </v-skeleton-loader>
    </div>
</template>

<script>
export default {
    name: 'ProductCard',
    props: {
        product: {
            type: Object,
            default: null
        },
        canDelete: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        formattedPrice: function() {
            const num = this.product ? Number(this.product.price) : 0;
            return num.toFixed(2);
        },
        imageUrl: function() {
            if (this.product.imageUrl && this.product.imageUrl.length) {
                return this.product.imageUrl;
            }else if (this.product.imageListing) {
                return `/api/images/${this.product.imageListing}`;
            }
            return '';
        },
        productSubtitle: function() {
            if (this.product) {
                if (!this.product.inStock) {
                    return `Out of Stock`;
                }else{
                    return `$${this.formattedPrice}`;
                }
            }
            return '';
        }
    },
    methods: {
        onDeletePressed: function() {
            this.$emit('delete',this.product);
        }
    },
    data: function() {
        return {
            
        }
    },
    
}
</script>

<style scoped>
.product-price {
    text-align: left;
}
</style>