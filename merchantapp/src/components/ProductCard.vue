<template>
    <div class="product-card">
        <v-card v-if="product">
            <v-img v-if="imageUrl.length"
                :src="imageUrl"
                height="200px"
            ></v-img>

            <v-card-title>{{product.title}}</v-card-title>
            <v-card-subtitle class="product-price">${{formattedPrice}}</v-card-subtitle>
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