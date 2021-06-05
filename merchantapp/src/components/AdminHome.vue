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
                                <b-list-group>
                                <b-list-group-item v-for="claim in claims" :to="{ name: 'ClaimDetail', params: { id: claim.id }}" :key="claim.id">
                                    <!-- <b-list-group-item> -->
                                        <div class="row ml-3">
                                            <h4 class="merchant-list">{{claim.Merchant.title}}</h4>
                                            
                                        </div>
                                        <div class="row ml-3">
                                            <div class="col">
                                                <h5 class="text-left claim-email" v-if="claim.email">Sent By: {{claim.email}}</h5>
                                                <p class="text-left claim-text">{{claim.text}}</p>
                                            </div>
                                        </div>
                                        <div class="row mr-3 justify-content-end">
                                            <p class="claim-created-date">{{claim.createdAt}}</p>
                                        </div>
                                        
                                    <!-- </b-list-group-item> -->
                                </b-list-group-item>
                                </b-list-group>
                            </div>
                            <div class="no-claims" v-else>
                                <p>There are no claims.</p>
                            </div>
                            </div>
                        </div>
                        <div class="row tools">
                            <div class="col">
                            <h3>Tools</h3>
                            <b-button class="m-1" :disabled="populateGeoLoading === true" v-on:click="populateGeometry()" v-b-tooltip.hover.bottom title="Populate addresses with geolocation data from Google Places API"><b-icon v-if="populateGeoLoading" icon="arrow-clockwise" animation="spin"></b-icon>Populate Geometry <b-badge v-if="populateGeoCount > 0" variant="light">{{populateGeoCount}}</b-badge></b-button>
                            <b-modal id="modal-populate-geo" title="Populate Geometry">
                                <p class="my-4">{{populateGeoResponse}}</p>
                            </b-modal>
                            <b-button class="m-1" :disabled="uploadLogoLoading === true" v-on:click="$bvModal.show('modal-upload-logo')"><b-icon v-if="uploadLogoLoading" icon="arrow-clockwise" animation="spin"></b-icon>Upload Logo</b-button>
                            <b-modal id="modal-upload-logo" title="Upload Logo" @ok="uploadLogo()" @show="resetUploadLogoModal">
                                <b-form-input class="mb-2" v-model="uploadedLogoMerchantId" placeholder="Merchant ID"></b-form-input>
                                <b-form-file
                                    v-model="uploadedLogo"
                                    :state="Boolean(uploadedLogo)"
                                    accept="image/png"
                                    placeholder="Choose an image or drop it here..."
                                    drop-placeholder="Drop image here..."
                                ></b-form-file>
                                <div class="mt-3" v-if="Boolean(uploadedLogo)">Selected file: {{ uploadedLogo ? uploadedLogo.name : '' }}</div>
                            </b-modal>
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
            uploadedLogoMerchantId: ''
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
                        this.makeToast('Populate Geometry',res.statusText,false,'danger');
                        return;
                    }
                    this.makeToast('Populate Geometry',res.data.message,false,'success');
                    this.getPopulateGeometryCount();
                })
                .catch(err => {
                    this.populateGeoLoading = false;
                    const msg = (err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                    this.makeToast('Populate Geometry',`${err}${msg}`,false,'danger');
                });
            });
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
                        this.makeToast('Upload Logo',`Error uploading logo: ${res.statusText} ${res.data.message}`,false,'danger');
                    }
                    this.makeToast('Upload Logo','Uploaded Logo Successfully!',false,'success');
                })
                .catch(err => {
                    this.uploadLogoLoading = false;
                    const msg = (err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                    this.makeToast('Upload Logo',`Error uploading logo: ${err}${msg}`,false,'danger');
                });
            });
        },
        resetUploadLogoModal: function() {
            this.uploadedLogoMerchantId = '';
            this.uploadedLogo = null;
        },
        makeToast: function(title,text, append = false, variant = null) {
            this.$bvToast.toast(text, {
                title: title,
                autoHideDelay: 5000,
                appendToast: append,
                variant: variant
            })
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