<template>
    <v-container fluid v-if="categories.length">
        <v-row>
            <div class="text-body mb-3">Filter By Category:</div>
            <v-spacer></v-spacer>
            <v-btn class="clear-categories" v-if="selected.length" @click="selected = [];" color="secondary">Clear Categories</v-btn>
        </v-row>
        <v-row>
            <v-col>
                <v-checkbox 
                v-for="category in categories" 
                v-model="selected"
                :key="category"
                :label="category"
                :value="category"
                color="secondary"
                class="my-n3">
                </v-checkbox>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    name: 'MerchantCategories',
    methods: {
        getCategories: function() {
            axios.get('/api/categories'
            ).then(res => {
                if (res.status != 200) {
                    console.log('ERROR');
                    throw new Error(res.statusText);
                }
                this.categories = res.data.categories.map((cat) => cat.category).filter((cat) => cat !== null).map((cat) => {let words = cat.split(" "); return words.map((word) => word[0].toUpperCase() + word.toLowerCase().substring(1)).join(" ")});
            })
            .catch(err => {
                this.error = err;
                if (err.json) {
                    return err.json.then(json => {
                        this.error.message = json.message;
                    });
                }
            });
        }
    },
    data: function() {
        return {
            selected: [],
            categories: []
        }
    },
    mounted: function() {

        if (localStorage.selectedMerchantCategories) {
            this.selected = localStorage.selectedMerchantCategories.split(';');
        }

        this.getCategories();
    },
    watch: {
        "selected": function() {
            this.$emit('change',this.selected);
            localStorage.selectedMerchantCategories = this.selected.join(';');
        }
    }
}
</script>

<style scoped>
.category-group {
    text-align: left;
    margin-top: 2rem;
}
</style>