<template>
    <div class="AdminHome">
        <BasePage>
            <template v-slot:header>
            </template>
            <BaseContent>
            <v-progress-circular v-if="loading"></v-progress-circular>
            <v-container class="mt-3" v-if="isAdmin">
                <v-row>
                    <v-col>
                        <h1>Admin</h1>
                        <v-row>
                            <v-col>
                                <h4 v-if="connectedClients <= 1">There is 1 client currently connected to the Localog.</h4>
                                <h4 v-else>There are {{connectedClients}} clients currently connected to the Localog.</h4>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-tabs v-model="tab">
                                <v-tab>Claims</v-tab>
                                <v-tab>Tools</v-tab>
                                <v-tab>Categories</v-tab>
                                <v-tab>Suggestions</v-tab>
                            </v-tabs>
                            <v-tabs-items v-model="tab" style="width: 100%; min-height: 300px;">
                                <v-tab-item class="claims">
                                    <merchant-claims></merchant-claims>
                                </v-tab-item>
                                <v-tab-item>
                                    <v-btn class="toolbutton" @click="populateGeometry()" :loading="populateGeoLoading">Populate Geometry</v-btn>
                                    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
                                        {{ snackbar.text }}
                                        <template v-slot:action="{ attrs }">
                                            <v-btn
                                            text
                                            v-bind="attrs"
                                            @click="snackbar.show = false"
                                            >
                                            Close
                                            </v-btn>
                                        </template>
                                    </v-snackbar>
                                    <v-dialog
                                    v-model="dialog.show"
                                    persistent
                                    max-width="290"
                                    >
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn
                                                class="toolbutton"
                                                v-bind="attrs"
                                                v-on="on"
                                                @click="showUploadDialog()"
                                                :loading="uploadLogoLoading"
                                            >Upload Logo</v-btn>
                                        </template>
                                        <v-card>
                                            <v-card-title class="text-h5">
                                                {{dialog.title}}
                                            </v-card-title>
                                            <v-card-text>
                                                {{dialog.text}}
                                            </v-card-text>
                                            <v-divider class="mx-4"></v-divider>
                                            <v-card-text>
                                                <v-text-field
                                                v-model="uploadedLogoMerchantId" 
                                                label="Merchant ID"
                                                prepend-icon="mdi-storefront"
                                                ></v-text-field>
                                            </v-card-text>
                                            <v-card-text>
                                                <v-file-input
                                                accept="image/png"
                                                label="Upload Logo"
                                                dense
                                                v-model="uploadedLogo"
                                                ></v-file-input>
                                            </v-card-text>
                                            <v-card-actions>
                                                <v-spacer></v-spacer>
                                                <v-btn
                                                    color="red darken-1"
                                                    text
                                                    @click="dialog.show = false"
                                                >{{dialog.notext}}</v-btn>
                                                <v-btn
                                                    color="green darken-1"
                                                    text
                                                    @click="dialog.show = false; dialog.action()"
                                                >{{dialog.yestext}}</v-btn>
                                            </v-card-actions>
                                        </v-card>
                                    </v-dialog>

                                    <v-btn
                                        class="toolbutton"
                                        @click="clearHoursCache"
                                        :loading="clearHoursCacheLoading"
                                    >Clear Hours Cache</v-btn>

                                    <v-btn
                                        class="toolbutton"
                                        @click="clearCategoriesCache"
                                        :loading="clearCategoriesCacheLoading"
                                    >Clear Categories Cache</v-btn>

                                    <v-btn
                                        class="toolbutton"
                                        @click="clearMerchantQueryCache"
                                        :loading="clearMerchantQueryLoading"
                                    >Clear Merchant Cache</v-btn>

                                    <v-btn
                                        class="toolbutton"
                                        @click="clearNeighbourhoodsCache"
                                        :loading="clearNeighbourhoodsCacheLoading"
                                    >Clear Neighbourhoods Cache</v-btn>
                                </v-tab-item>
                                <v-tab-item>
                                    <v-dialog v-model="categoryDialog" max-width="450"
                                    >
                                        <v-card
                                        >
                                            <v-card-title>Delete Category '{{toDeleteCategory}}'</v-card-title>
                                            <v-card-text>Are you sure you want to delete '{{toDeleteCategory}}'?
                                                {{categoryDialogText}}
                                            </v-card-text>
                                            <v-card-actions>
                                                <v-spacer></v-spacer>
                                                <v-btn
                                                    text
                                                    @click="categoryDialog = false;"
                                                >Cancel</v-btn>
                                                <v-btn
                                                    text
                                                    @click="deleteCategory(toDeleteCategory); categoryDialog = false;"
                                                >Delete</v-btn>
                                            </v-card-actions>
                                        </v-card>
                                    </v-dialog>
                                    <v-container>
                                        <v-overlay absolute :value="categoryLoading">
                                            <v-progress-circular
                                                indeterminate
                                                size="64"
                                            ></v-progress-circular>
                                        </v-overlay>
                                        <v-row>
                                            <v-col>
                                            <v-text-field
                                                v-model="newCategory"
                                                label="Add Category"
                                                @keydown="categoryKeydown($event)"
                                            >
                                                <template v-slot:append-outer>
                                                    <v-btn fab small color="primary" @click="addCategory(newCategory); newCategory = ''">
                                                    <v-icon>mdi-plus</v-icon>
                                                    </v-btn>
                                                </template>
                                            </v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col >
                                                <v-chip-group column>
                                                    <v-chip v-for="(category) in categories" v-bind:key="category" close @click:close="confirmDeleteCategory(category)"> 
                                                        {{category}}
                                                    </v-chip>
                                                </v-chip-group>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </v-tab-item>
                                <v-tab-item>
                                    <merchant-suggestions></merchant-suggestions>
                                </v-tab-item>
                            </v-tabs-items>
                        </v-row>
                    </v-col>
                </v-row>
            </v-container>
            </BaseContent>
        </BasePage>
    </div>
</template>

<script>
import axios from 'axios';
import BasePage from './base/BasePage.page.vue';
import BaseContent from './base/BaseContent.page.vue';
import { MerchantService } from '../service/Merchant.service';
import MerchantSuggestions from '../components/MerchantSuggestions.vue';
import MerchantClaims from '../components/MerchantClaims.vue';

export default {
    name: 'AdminHome',
    components: {
        BasePage,
        BaseContent,
        MerchantSuggestions,
        MerchantClaims
    },
    data: function() {
        return {
            adminLoading: true,
            tab: 0,
            connectedClients: 0,
            isAdmin: false,
            populateGeoResponse: '',
            populateGeoLoading: false,
            populateGeoCount: 0,
            uploadLogoLoading: false,
            uploadedLogo: null,
            uploadedLogoMerchantId: '',
            clearHoursCacheLoading: false,
            clearCategoriesCacheLoading: false,
            clearNeighbourhoodsCacheLoading: false,
            clearMerchantQueryLoading: false,
            snackbar: {
                color: 'primary',
                show: false,
                text: '',
                timeout: 2000
            },
            dialog: {
                show: false,
                title: '',
                text: '',
                notext: '',
                yestext: '',
                action: null
            },
            categories: [],
            newCategory: '',
            categoryLoading: false,
            categoryDialog: false,
            toDeleteCategory: '',
            categoryDialogText: ''
        }
    },
    methods: {
        getConnectedClients: function() {
            const url = `/api/admin/connectedclients`;
            this.$auth.getTokenSilently().then((authToken) => {
                axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                })
                .then(res => {
                    if (res.status != 200) {
                        return;
                    }
                    this.connectedClients = res.data.clients;
                })
                .catch(() => {
                });
            });
        },
        getPopulateGeometryCount: function() {
            const url = `/api/admin/populategeo?count=true`;
            this.populateGeoCount = 0;
            this.$auth.getTokenSilently().then((authToken) => {
                axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                })
                .then(res => {
                    if (res.status != 200) {
                        return;
                    }
                    this.populateGeoCount = res.data.count;
                })
                .catch(() => {
                    this.populateGeoCount = 0;
                });
            });
        },
        clearHoursCache: function() {
            const url = `/api/admin/hours/clearcache`;
            this.clearHoursCacheLoading = true;
            this.$auth.getTokenSilently().then((authToken) => {
                axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                })
                .then(res => {
                    this.clearHoursCacheLoading = false;
                    if (res.status != 200) {
                        this.makeToast(res.statusText,'danger');
                        return;
                    }
                    this.makeToast(res.data.message,'success');
                    this.getPopulateGeometryCount();
                })
                .catch(err => {
                    this.clearHoursCacheLoading = false;
                    const msg = (err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                    this.makeToast(`${err}${msg}`,'danger');
                });
            });
        },
        clearCategoriesCache: function() {
            const url = `/api/admin/categories/clearcache`;
            this.clearCategoriesCacheLoading = true;
            this.$auth.getTokenSilently().then((authToken) => {
                axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                })
                .then(res => {
                    if (res.status != 200) {
                        this.makeToast(res.statusText,'danger');
                        return;
                    }
                    this.makeToast(res.data.message,'success');
                })
                .catch(err => {
                    const msg = (err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                    this.makeToast(`${err}${msg}`,'danger');
                }).then(() => {this.clearCategoriesCacheLoading = false;});
            });
        },
        clearNeighbourhoodsCache: function() {
            const url = `/api/admin/neighbourhoods/clearcache`;
            this.clearNeighbourhoodsCacheLoading = true;
            this.$auth.getTokenSilently().then((authToken) => {
                axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                })
                .then(res => {
                    if (res.status != 200) {
                        this.makeToast(res.statusText,'danger');
                        return;
                    }
                    this.makeToast(res.data.message,'success');
                })
                .catch(err => {
                    const msg = (err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                    this.makeToast(`${err}${msg}`,'danger');
                }).then(() => {this.clearNeighbourhoodsCacheLoading = false;});
            });
        },
        clearMerchantQueryCache: function() {
            const url = `/api/admin/merchants/clearcache`;
            this.clearMerchantQueryLoading = true;
            this.$auth.getTokenSilently().then((authToken) => {
                axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                })
                .then(res => {
                    if (res.status != 200) {
                        this.makeToast(res.statusText,'danger');
                        return;
                    }
                    this.makeToast(res.data.message,'success');
                    this.getPopulateGeometryCount();
                })
                .catch(err => {
                    const msg = (err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                    this.makeToast(`${err}${msg}`,'danger');
                }).then(() => {this.clearMerchantQueryLoading = false;});
            });
        },
        populateGeometry: function() {
            const url = `/api/admin/populategeo`;
            this.populateGeoLoading = true;
            this.$auth.getTokenSilently().then((authToken) => {
                axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                })
                .then(res => {
                    this.populateGeoLoading = false;
                    if (res.status != 200) {
                        this.makeToast(res.statusText,'danger');
                        return;
                    }
                    this.makeToast(res.data.message,'success');
                    this.getPopulateGeometryCount();
                })
                .catch(err => {
                    this.populateGeoLoading = false;
                    const msg = (err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                    this.makeToast(`${err}${msg}`,'danger');
                });
            });
        },
        showUploadDialog: function() {
            this.uploadedLogo = null;
            this.uploadedLogoMerchantId = '';
            this.dialog.title="Upload Logo";
            this.dialog.text="Enter a merchant ID and upload a png file to set as that merchant's logo.";
            this.dialog.yestext="Upload"
            this.dialog.notext="Cancel"
            this.dialog.action = this.uploadLogo;
            this.dialog.show = true;
        },
        uploadLogo: function() {
            this.uploadLogoLoading = true;
            const url = `/api/merchants/${this.uploadedLogoMerchantId}/images/logo`;
            this.$auth.getTokenSilently().then((authToken) => {
                let formData = new FormData();
                formData.append('logo',this.uploadedLogo);
                axios.post(url, formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${authToken}`
                    },
                })
                .then(res => {
                    this.uploadLogoLoading = false;
                    if (res.status != 201) {
                        this.makeToast(`Error uploading logo: ${res.statusText} ${res.data.message}`,'danger',5000);
                    }
                    this.makeToast('Uploaded Logo Successfully!','success');
                })
                .catch(err => {
                    this.uploadLogoLoading = false;
                    const msg = (err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                    this.makeToast(`Error uploading logo: ${err}${msg}`,'danger',5000);
                });
            });
        },
        makeToast: function(text, color, timeout=2000) {
            this.snackbar.timeout = timeout;
            this.snackbar.color = color;
            this.snackbar.text = text;
            this.snackbar.show = true;
        },
        categoryKeydown: function(event) {
            if (event.key.toUpperCase() === 'ENTER') {
                this.addCategory(this.newCategory);
                this.newCategory = '';
            }
        },
        addCategory: function(cat) {
            const category = cat.split(' ').reduce((prev, curr) => prev + ' ' + curr.charAt(0).toUpperCase() + curr.slice(1),'').slice(1);
            this.categoryLoading = true;
            this.$auth.getTokenSilently().then((authToken) => {
                MerchantService.addCategory(category, authToken).then(res => {
                    this.categories = res;
                }, err => console.log(err)).then(() => this.categoryLoading = false);
            })
        },
        confirmDeleteCategory: function(category) {
            this.$auth.getTokenSilently().then((authToken) => {
                // TODO: Also heck if category has any products attached.
                MerchantService.getMerchantsForCategory(category, authToken).then((res) => {
                    this.categoryDialogText = '';
                    if (res.merchants) {
                        if (res.merchants.length == 1) {
                            this.categoryDialogText = `There is ${res.merchants.length} merchant attached to this category.`;
                        }else{
                            this.categoryDialogText = `There are ${res.merchants.length} merchants attached to this category.`;
                        }
                    }
                    this.toDeleteCategory = category;
                    this.categoryDialog = true;
                }, err => console.log(err)).then(() => this.categoryLoading = false);
            });
        },
        deleteCategory: function(category) {
            this.categoryLoading = true;
            this.$auth.getTokenSilently().then((authToken) => {
                MerchantService.deleteCategory(category, authToken).then(() => {
                    this.getCategories();
                }, err => console.log(err)).then(() => this.categoryLoading = false);
            });
        },
        getCategories: function() {
            this.categoryLoading = true;
            this.$auth.getTokenSilently().then((authToken) => {
            MerchantService.getCategories(true,'',authToken).then(res => this.categories = res, err => console.log(err)).then(() => this.categoryLoading = false);
            });
        }
    },
    updated: function() {
        document.title = 'Admin - The Localog';
    },
    mounted: function() {
        this.isAdmin = false;
        const url = `/api/admin`
        this.$auth.getTokenSilently().then((authToken) => {
            axios.get(url, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            .then(res => {
                this.loading=false;
                if (res.status != 200) {
                    this.$router.push('Merchants');
                    return;
                }else{
                    this.isAdmin = true;
                    this.getConnectedClients();
                }
            })
            .catch(() => {
                this.$router.push('Merchants');
            });
        });
        this.getPopulateGeometryCount();
        this.getCategories();
    },
    created: function() {
        this.loading = true;
    }
}
</script>

<style scoped>
.toolbutton {
    margin: 0.3rem;
}
.claims {
    width: 100%;
}
</style>