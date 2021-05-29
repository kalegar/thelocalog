<template>
    <div>
    <b-button class="clear-categories" v-if="selected.length" v-on:click="selected = [];">Clear Categories</b-button>
    <b-form-group class="category-group" label="Filter by Category:">
        <b-form-checkbox-group 
            id="checkbox-group-categories"
            v-model="selected"
            :options="categories"
            stacked
            size="lg"
            name="category">
        
        </b-form-checkbox-group>
    </b-form-group>
    </div>
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
            this.$emit('categories',this.selected);
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
.clear-categories {
    float: right;
}
</style>