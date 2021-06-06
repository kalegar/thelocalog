<template>
    <div class="AdminHome">
        <BasePage>
            <template v-slot:header>
            </template>
            <BaseContent>
            <v-container class="mt-3" v-if="isAdmin">
                <v-row>
                    <v-col>
                        <h1>Admin</h1>
                        <div class="row claims">
                            <div class="col">
                            <h3>Claims</h3>
                            <div class="claims" v-if="claims && claims.length">
                                <v-list three-line>
                                    <template v-for="(claim,index) in claims">
                                            <v-list-item :to="{ name: 'ClaimDetail', params: { id: claim.id }}" :key="claim.id">
                                                <v-list-item-avatar>
                                                    <v-icon>mdi-storefront</v-icon>
                                                </v-list-item-avatar>

                                                <v-list-item-content class="merchant-list-item">
                                                    <v-list-item-title class="h5">{{claim.Merchant.title}}</v-list-item-title>
                                                    <v-list-item-subtitle v-if="claim.email">{{claim.email}}</v-list-item-subtitle>
                                                    <v-list-item-subtitle>{{claim.text}}</v-list-item-subtitle>
                                                    <v-list-item-subtitle>{{claim.createdAt}}</v-list-item-subtitle>
                                                </v-list-item-content>
                                            </v-list-item>
                                        <v-divider
                                        :key="index"
                                        class="mx-4"
                                        ></v-divider>
                                    </template>
                                </v-list>
                            </div>
                            <div class="no-claims" v-else>
                                <p>There are no claims.</p>
                            </div>
                            </div>
                        </div>
                        <div class="row tools">
                            <div class="col">
                            <h3>Tools</h3>

                            <v-btn @click="populateGeometry()" :disabled="populateGeoLoading === true">Populate Geometry</v-btn>
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
                                        v-bind="attrs"
                                        v-on="on"
                                        @click="showUploadDialog()"
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
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </v-container>
            </BaseContent>
        </BasePage>
    </div>
</template>

<script>
import axios from 'axios';
import BasePage from './BasePage.vue';
import BaseContent from './BaseContent.vue';

export default {
    name: 'AdminHome',
    components: {
        BasePage,
        BaseContent
    },
    data: function() {
        return {
            claims: [],
            isAdmin: false,
            populateGeoResponse: '',
            populateGeoLoading: false,
            populateGeoCount: 0,
            uploadLogoLoading: false,
            uploadedLogo: null,
            uploadedLogoMerchantId: '',
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
            }
        }
    },
    methods: {
        getClaims: function() {
            const url = `/api/admin/claims`
            this.$auth.getTokenSilently().then((authToken) => {
                axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                })
                .then(res => {
                    if (res.status != 200) {
                        console.log('ERROR');
                        const error = new Error(res.statusText);
                        throw error;
                    }
                    if (res.data.claims) {
                        this.claims = res.data.claims;
                    }
                })
                .catch(err => {
                    this.error = err;
                    if (err.json) {
                        return err.json.then(json => {
                            this.error.message = json.message;
                        });
                    }
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
                    this.makeToast('Uploaded Logo Successfully!',false,'success');
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
                if (res.status != 200) {
                    this.$router.push('Merchants');
                    return;
                }else{
                    this.isAdmin = true;
                    this.getClaims();
                }
            })
            .catch(() => {
                this.$router.push('Merchants');
            });
        });
        this.getPopulateGeometryCount();
    }
}
</script>

<style scoped>
</style>