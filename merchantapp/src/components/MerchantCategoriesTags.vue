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
                color="secondary"
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
                color="secondary"
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
            merchantCategories: [],
            categories: [],
            selectedTags: [],
            merchantTags: [],
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
            this.selectedCategories = [...this.merchantCategories];
            this.selectedTags = [...this.merchantTags];
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
                    this.merchantCategories = [...this.selectedCategories];
                    this.merchantTags       = [...this.selectedTags];
                }).catch(() => {
                    this.editing = false;
                    this.saveLoading = false;
                    this.selectedCategories = [...this.merchantCategories];
                    this.selectedTags = [...this.merchantTags];
                });
            },
            () => {
                this.editing = false;
                this.saveLoading = false;
                this.selectedCategories = [...this.merchantCategories];
                this.selectedTags = [...this.merchantTags];
            });
        },
        getCategories: function() {
            this.$auth.getTokenSilently().then((authToken) => {
            MerchantService.getCategories(true,'',authToken).then(
                (res) => {
                this.categories = res.sort();
                this.getMerchantCategories(true);
                },
                () => {
                console.log('error');
                this.categories = []
                }
            );
            });
        },
        getMerchantTags: function(apply = false) {
            MerchantService.getMerchantTags(this.merchantId,true).then(
                (res) => {
                this.merchantTags = res.sort();
                },
                () => {
                this.merchantTags = []
                }
            ).then(() => {
                if (apply) {
                    this.selectedTags = [...this.merchantTags];
                }
            });
        },
        getMerchantCategories: function(apply = false) {
            MerchantService.getMerchantCategories(this.merchantId,true).then(
                (res) => {
                this.merchantCategories = res.sort();
                },
                () => {
                this.merchantCategories = []
                }
            ).then(() => {
                if (apply) {
                    this.selectedCategories = [...this.merchantCategories];
                }
            });
        }
    },
    mounted: function() {
        this.getCategories();
        this.getMerchantTags(true);
    }
}
</script>