<template>
    <v-expansion-panels flat v-if="categories.length">
        <v-expansion-panel>
            <v-expansion-panel-header class="px-0">
                Filter By Category:
                <v-spacer></v-spacer>
                <v-btn class="clear-categories mx-3" v-if="value.length" @click.stop="value = []; updateInput();" color="secondary" small>Clear</v-btn>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
                <v-row class="px-0 mx-n6 mt-1">
                    <v-col class="px-0">
                        <v-checkbox 
                        v-for="category in categories" 
                        v-model="value"
                        :key="category"
                        :label="category"
                        :value="category"
                        color="secondary"
                        @change="updateInput"
                        class="my-n3">
                        </v-checkbox>
                    </v-col>
                </v-row>
            </v-expansion-panel-content>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script>
import axios from 'axios';

export default {
    name: 'MerchantCategories',
    model: {
      prop: 'modelValue',
      event: 'change'
    },
    props: {
      modelValue: {
        type: Array,
        default: () => []
      }
    },
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
        },
        updateInput: function(store = true) {
            this.$emit('change',this.value);
            if (store)
                this.save();
        },
        save: function() {
            localStorage.selectedMerchantCategories = this.value.join(';');
        }
    },
    data: function() {
        return {
            value: [],
            categories: []
        }
    },
    mounted: function() {
        this.getCategories();
        if (localStorage.selectedMerchantCategories) {
            this.value = localStorage.selectedMerchantCategories.split(';');
            this.updateInput(false);
        }
    },
    watch: {
        "modelValue": function() {
            this.value = this.modelValue;
            this.save();
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