<template>
    <v-card>
        <div v-if="canEdit" class="d-flex justify-end mr-9 mb-n9">
            <v-btn fab top right class="mt-n4 mx-2" @click="startEditing"  v-if="!editing" ><v-icon>mdi-pencil</v-icon></v-btn>
            <v-btn fab top right class="mt-n4 mx-2" @click="saveData"      v-if="editing" :loading="saveLoading" :disabled="saveLoading"><v-icon>mdi-content-save</v-icon></v-btn>
            <v-btn fab top right class="mt-n4 mx-2" @click="cancelEditing" v-if="editing" :loading="saveLoading" :disabled="saveLoading"><v-icon>mdi-cancel</v-icon></v-btn>
        </div>
        <v-card-title>Categories and Tags</v-card-title>
        <v-card-text>
            <v-row>
            <v-col>
                <v-select
                v-model="selectedCategories"
                :items="categories"
                chips
                deletable-chips
                label="Categories"
                multiple
                :menu-props="{ offsetY: true, offsetOverflow: true, maxHeight: '200px' }"
                :readonly="!editing"
                ></v-select>
            </v-col>
            </v-row>
            <v-row>
            <v-col>
                <v-combobox
                v-model="selectedTags"
                :items="tags"
                chips
                deletable-chips
                label="Tags"
                multiple
                :menu-props="{ offsetY: true, offsetOverflow: true, maxHeight: '200px' }"
                hint="Enter tags seperated by spaces."
                :delimiters="[' ']"
                :readonly="!editing"
                ></v-combobox>
            </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
import { MerchantService } from '../service/Merchant.service.js';

export default {
    name: 'MerchantCategoriesTags',
    props: {
        merchantId: String,
        canEdit: {
            type: Boolean,
            default: false
        }
    },
    data: function() {
        return {
            editing: false,
            saveLoading: false,
            selectedCategories: [],
            categories: [],
            selectedTags: [],
            tags: []
        }
    },
    watch: {
        "merchantId": function(newValue) {
            if (newValue && newValue.length > 0) {
                this.getCategories();
                this.getMerchantTags();
            }
        }
    },
    methods: {
        startEditing: function() {
            if (this.canEdit) {
                this.editing = true;
            }
        },
        cancelEditing: function() {
            this.editing = false;
        },
        saveData: function() {
            this.saveLoading = true;
            this.$auth.getTokenSilently().then((authToken) => {
                Promise.all([
                    MerchantService.setMerchantTags(this.merchantId,authToken,this.selectedTags),
                    MerchantService.setMerchantCategories(this.merchantId,authToken,this.selectedCategories)
                ]).then(() => {
                    this.editing = false;
                    this.saveLoading = false;
                }).catch(() => {
                    this.editing = false;
                    this.saveLoading = false;
                    this.getMerchantTags();
                    this.getMerchantCategories();
                });
            },
            () => {
                this.editing = false;
                this.saveLoading = false;
            });
        },
        getCategories: function() {
            MerchantService.getCategories().then(
                (res) => {
                this.categories = res.sort();
                this.getMerchantCategories();
                },
                () => {
                console.log('error');
                this.categories = []
                }
            );
        },
        getMerchantTags: function() {
            MerchantService.getMerchantTags(this.merchantId,true).then(
                (res) => {
                this.selectedTags = res.sort();
                },
                () => {
                this.tags = []
                }
            );
        },
        getMerchantCategories: function() {
            MerchantService.getMerchantCategories(this.merchantId,true).then(
                (res) => {
                this.selectedCategories = res.sort();
                },
                () => {
                this.selectedCategories = []
                }
            );
        }
    },
    mounted: function() {
        this.getCategories();
        this.getMerchantTags();
    }
}
</script>