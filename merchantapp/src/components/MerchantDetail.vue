<template>
    <div class="MerchantDetail">
        <BasePage>
            <template v-slot:header>
                <SearchBar/>
            </template>
            <BaseContent>
                <template v-slot:left v-if="$auth.isAuthenticated && !loading && merchant">
                    <div class="mt-4 sidebar">
                        <h4>Admin Tools</h4>
                        <b-button class="m-1" v-if="!merchant.deletedAt" :disabled="deleteMerchantLoading === true" v-on:click="deleteMerchant()"><b-icon v-if="deleteMerchantLoading" icon="arrow-clockwise" animation="spin"></b-icon>Delete Merchant</b-button>
                        <b-button class="m-1" v-else :disabled="saveMerchantLoading === true" v-on:click="merchant.deletedAt = null; saveMerchant()"><b-icon v-if="saveMerchantLoading" icon="arrow-clockwise" animation="spin"></b-icon>Restore Merchant</b-button>
                        <b-button class="m-1" v-if="!editing" v-on:click="editing = true"><b-icon class="mr-1" icon="pencil-square"></b-icon>Edit Merchant</b-button>
                        <b-button class="m-1" v-if="editing" :disabled="saveMerchantLoading === true" v-on:click="saveMerchant()"><b-icon v-if="saveMerchantLoading" icon="arrow-clockwise" animation="spin"></b-icon>Save</b-button>
                        <b-button class="m-1" v-if="editing" v-on:click="editing = false; getMerchant()">Cancel</b-button>
                    </div>
                </template>
                <transition name="fade" mode="out-in">
                    <div v-if="loading" key="skeleton">
                        <div class="container" style="text-align:left;margin-top:2em;">
                            <b-skeleton class="mt-3" width="20%" height="2.5em"></b-skeleton>
                            <b-card class="mt-2">
                            <b-skeleton width="85%"></b-skeleton>
                            <b-skeleton width="55%"></b-skeleton>
                            <b-skeleton width="70%"></b-skeleton>
                            </b-card>
                            <b-skeleton class="mt-3" width="20%" height="2em"></b-skeleton>
                            <b-card class="mt-2">
                                <b-skeleton-img>
                                </b-skeleton-img>
                            </b-card>
                        </div>
                    </div>
                    <div class="merchant container" v-if="!loading && merchant" key="merchant">
                        <div class="row title">
                            <div class="col my-auto">
                                <h1 v-if="!editing">{{merchant.title}}</h1>
                                <b-form-input v-else v-model="merchant.title" placeholder="Merchant Title"></b-form-input>
                            </div>
                            <div class="col" v-if="logo && logo.length">
                                <img class="logo" :src="'data:image/png;base64,'+logo[0].image" />
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <b-card>
                                <p v-if="!editing">{{merchant.description}}</p>
                                <b-form-textarea v-else v-model="merchant.description" placeholder="Description" rows="3" max-rows="10"></b-form-textarea>
                                <div v-if="merchant.website">
                                    <a v-if="!editing" :href="merchant.website" target="_blank">{{merchant.website}}</a>
                                    <b-form-input v-else class="mt-2" v-model="merchant.website" placeholder="Website"></b-form-input>
                                </div>
                                </b-card>
                            </div>
                        </div>
                        <div class="addresses row" v-if="merchant.Addresses">
                            <div class="col">
                            <h2 v-if="merchant.Addresses.length > 1">Locations:</h2>
                            <h2 v-if="merchant.Addresses.length == 1">Location:</h2>
                            <div class="addresscard card shadow" v-for="(address, index) in merchant.Addresses" :key="address.id">
                                <GoogleMapsEmbed :mapParams="encodeAddress(merchant.title,address)"/>
                                <div class="addressdetails container fluid">
                                    <div class="row d-block d-sm-flex">
                                        <div class="col address" align="justify-content-center">
                                        <h4>Address:</h4>
                                        <p>{{address.address1}}</p>
                                        <p v-if="address.address2">{{address.address2}}</p>
                                        <p v-if="address.address3">{{address.address3}}</p>
                                        <p>{{address.city}}, {{address.province}}, {{address.country}}</p>
                                        <p>{{address.postalcode}}</p>
                                        </div>
                                        <div class="col hours mt-3-xs" v-if="hours && hours.length">
                                            <h4>Hours:</h4>
                                            <p v-if="hours[index].status">{{hours[index].status}}</p>
                                            <div v-if="hours[index].hours">
                                            <p class="hour" v-for="hour in hours[index].hours" :key="hour">
                                                {{hour}}
                                            </p>
                                            </div>
                                        </div>
                                    </div>
                                    <SocialMediaLinks :links="merchant.SocialMediaLinks"/>
                                </div>
                            </div>
                            </div>
                        </div>
                        <div class="merchant-footer row align-items-center">
                            <div class="col">
                                
                            <p>Do you own this business? Click <router-link class="claim-link" :to="{ name: 'MerchantClaim', params: { id: merchant.id }}">here</router-link> to claim it.</p>
                            </div>
                        </div>
                    </div>
                </transition>
                    <Loading :loading="loading"/>
            </BaseContent>
        </BasePage>
    </div>
</template>

<script>
import axios from 'axios';
import Loading from './Loading.vue';
import BasePage from './BasePage.vue';
import BaseContent from './BaseContent.vue';
import SearchBar from './SearchBar.vue';
import GoogleMapsEmbed from './GoogleMapsEmbed.vue'
import SocialMediaLinks from './SocialMediaLinks.vue'

export default {
    name: 'MerchantDetail',
    props: {
        id: String
    },
    components: {
        Loading,
        BasePage,
        BaseContent,
        SearchBar,
        GoogleMapsEmbed,
        SocialMediaLinks
    },
    data: function() {
        return {
            merchant: null,
            loading: false,
            hours: [],
            logo: [],
            error: null,
            deleteMerchantLoading: false,
            saveMerchantLoading: false,
            editing: false
        }
    },
    methods: {
        encodeAddress: function(title,address) {
            const queryStr = 'q=' + title+' '+address.address1 + 
                (address.address2 ? ' ' + address.address2 : '') +
                (address.address3 ? ' '+ address.address3 : '') +
                (address.city ? address.city + ' ' : '') +
                (address.province ? address.province + ' ' : '') +
                (address.postalcode ? address.postalcode + ' ' : '');

            
            return encodeURI(queryStr.replace('&','%26'));
        },
        getBusinessHours: function() {
            const url = `/api/merchants/${this.id}/hours`
            axios.get(url)
            .then(res => {
                if (res.status != 200) {
                    console.log('getBusinessHours() Error');
                    const error = new Error(res.statusText);
                    throw error;
                }
                if (res.data.data) {
                    for (const address of this.merchant.Addresses) {
                        const hours = res.data.data.filter(e => e.address_id == address.id);
                        if (hours.length > 0) {
                            let business_status = '';
                            switch (hours[0].status) {
                                case "OPERATIONAL": business_status = ''; break;
                                case "CLOSED_TEMPORARILY": business_status = 'Closed Temporarily'; break;
                                case "CLOSED_PERMANENTLY": business_status = 'Closed Permanently'; break;
                                case "NO_INFO": business_status = 'Not Available'; break;
                            }
                            this.hours.push({status: business_status, hours: hours[0].hours});
                        }
                    }
                }
            })
            .catch(err => {
                console.log(err);
            })
        },
        getLogo: function() {
            const url = `/api/merchants/${this.id}/images`
            axios.get(url,{ params: { type: 'LOGO' }})
            .then(res => {
                if (res.status != 200) {
                    console.log('Error retrieving logo');
                    const error = new Error(res.statusText);
                    throw error;
                }
                this.logo = res.data;
            })
            .catch(err => {
                console.log(err);
            })
        },
        saveMerchant: function() {
            this.saveMerchantLoading = true;
            const url = `/api/merchants/${this.id}`;
            this.$auth.getTokenSilently().then((authToken) => {
                axios.put(url, this.merchant,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    },
                })
                .then(res => {
                    if (res.status != 200) {
                        this.makeToast('Update Merchant',`Error updating merchant: ${res.statusText} ${res.data.message}`,false,'danger');
                    }else{
                        this.makeToast('Update Merchant','Updated!',false,'success');
                    }
                })
                .catch(err => {
                    const msg = (err.response && err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                    this.makeToast('Update Merchant',`Error updating merchant: ${err}${msg}`,false,'danger');
                })
                .then(() => {this.saveMerchantLoading = false; this.editing = false; this.getMerchant()});
            });
        },
        deleteMerchant: function() {
            this.deleteMerchantLoading = true;
            this.$bvModal.msgBoxConfirm('Are you sure you want to soft-delete this merchant?', {
                title: 'Confirm Deletion',
                size: 'sm',
                okVariant: 'danger',
                okTitle: 'Yes',
                cancelTitle: 'No'
            })
            .then(value => {
                if (value === true) {
                    const url = `/api/merchants/${this.id}`;
                    this.$auth.getTokenSilently().then((authToken) => {
                        axios.delete(url,
                        {
                            headers: {
                                Authorization: `Bearer ${authToken}`
                            },
                        })
                        .then(res => {
                            if (res.status != 200) {
                                this.makeToast('Delete Merchant',`Error deleting merchant: ${res.statusText} ${res.data.message}`,false,'danger');
                            } else {
                                this.makeToast('Delete Merchant','Soft-deleted Merchant!',false,'success');
                                this.getMerchant();
                            }
                        })
                        .catch(err => {
                            const msg = (err.response && err.response.data && err.response.data.message ? ' ' + err.response.data.message : '');
                            this.makeToast('Delete Merchant',`Error deleting merchant: ${err}${msg}`,false,'danger');
                        })
                        .then(() => this.deleteMerchantLoading = false);
                    });
                }else{
                    this.deleteMerchantLoading = false;
                }
            })
            .catch(() => {
                this.makeToast('Delete Merchant',`Error deleting merchant.`,false,'danger');
                this.deleteMerchantLoading = false;
            })
        },
        makeToast: function(title,text, append = false, variant = null) {
            this.$bvToast.toast(text, {
                title: title,
                autoHideDelay: 5000,
                appendToast: append,
                variant: variant
            })
        },
        getMerchant: function() {
            this.loading = true;
            this.merchant = null;
            const url = `/api/merchants/${this.id}`
            axios.get(url, {
                params: {
                    'details': true,
                    'include': 'address,social'
                }
            })
            .then(res => {
                if (res.status != 200) {
                    console.log('ERROR');
                    const error = new Error(res.statusText);
                    throw error;
                }
                this.merchant = res.data.merchant;
                this.getBusinessHours();
                this.getLogo();
            })
            .catch(err => {
                this.error = err;
                if (err.json) {
                    return err.json.then(json => {
                        this.error.message = json.message;
                    });
                }
            })
            .then(() => {
                this.loading = false;
            });
        }
    },
    updated: function() {
        document.title = (this.merchant && this.merchant.title) ? this.merchant.title + ' - The Localog' : 'Local Shop - The Localog';
    },
    mounted: function() {
        this.getMerchant();
    }
}
</script>

<style scoped>
b-skeleton {
    text-align: left;
}
h2, h1 {
    text-align: left;
}
.addresses {
    margin-top: 16px;
}
.addressdetails {
    margin-top: 1rem;
}
.addresscard {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
}
.merchant {
    margin-top: 24px;
}
.address {
    text-align: left;
}
.hours h4 {
    text-align: left;
    
}
.hour {
    text-align: left;
    margin-left: 1rem;
    margin-bottom: 0;
}
.address p {
    margin-bottom: 0;
    margin-left: 1rem;
}
.social-media-links {
    margin-top: 1rem;
}
.logo {
    max-width: 12rem;
    max-height: 12rem;
}
.title {
    margin-bottom: 0.5rem;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .25s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.claim-link {
    font-weight: bold;
}
</style>