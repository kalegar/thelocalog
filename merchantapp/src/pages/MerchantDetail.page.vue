<template>
    <div class="MerchantDetail">
        <BasePage>
            <template v-slot:header>
            </template>
            <BaseContent>
                <template v-slot:left v-if="$auth.isAuthenticated && !loading && merchant">
                    <div class="mt-4 sidebar">
                        <h4>Admin Tools</h4>
                        <v-btn class="ma-1" v-if="!merchant.deletedAt" color="danger" dark :loading="deleteMerchantLoading" v-on:click="deleteMerchant()">Delete<v-icon right dark>mdi-delete</v-icon></v-btn>
                        <v-btn class="ma-1" v-else color="success" light :loading="saveMerchantLoading" v-on:click="merchant.deletedAt = null; saveMerchant()">Restore<v-icon right dark>mdi-restore</v-icon></v-btn>
                        <v-btn class="ma-1" v-if="!editing" v-on:click="editing = true">Edit<v-icon right dark>mdi-pencil</v-icon></v-btn>
                        <v-btn class="ma-1" v-if="editing" :loading="saveMerchantLoading" v-on:click="saveMerchant()">Save<v-icon right dark>mdi-content-save</v-icon></v-btn>
                        <v-btn class="ma-1" v-if="editing" v-on:click="editing = false; getMerchant()">Cancel<v-icon right dark>mdi-cancel</v-icon></v-btn>
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
                </template>
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
                <transition name="fade" mode="out-in">
                    <div v-if="loading" key="skeleton">
                        <div class="container" style="text-align:left;margin-top:2em;">
                            <v-skeleton-loader
                                type="article,image"
                            ></v-skeleton-loader>
                        </div>
                    </div>
                    <div class="merchant container" v-if="!loading && merchant" key="merchant">
                        <div class="row title">
                            <div class="col my-auto">
                                <h1 v-if="!editing">{{merchant.title}}</h1>
                                <v-text-field v-else v-model="merchant.title" label="Merchant Title"></v-text-field>
                            </div>
                            <div class="col" v-if="logo && logo.length">
                                <img class="logo" :src="'data:image/png;base64,'+logo[0].image" />
                            </div>
                        </div>
                        <div class="row">
                            <div class="col mt-n4">
                                <v-card>
                                    <v-card-text>
                                    <p v-if="!editing">{{merchant.description}}</p>
                                    <v-textarea v-else v-model="merchant.description" label="Description" rows="3"></v-textarea>
                                    <div v-if="merchant.website" class="mt-4">
                                        <a v-if="!editing" :href="merchant.website" target="_blank">{{merchant.website}}</a>
                                        <v-text-field v-else class="mt-2" v-model="merchant.website" label="Website"></v-text-field>
                                    </div>
                                    <v-divider v-if="merchant.SocialMediaLinks && merchant.SocialMediaLinks.length" class="my-4"></v-divider>
                                    <SocialMediaLinks :links="merchant.SocialMediaLinks"/>
                                    </v-card-text>
                                </v-card>
                            </div>
                        </div>
                        <div class="addresses row" v-if="merchant.Addresses">
                            <div class="col">
                            <h2 v-if="merchant.Addresses.length > 1">Locations:</h2>
                            <h2 v-if="merchant.Addresses.length == 1">Location:</h2>
                            <v-card class="addresscard" v-for="(address, index) in merchant.Addresses" :key="address.id" elevation="6">
                                <GoogleMapsEmbed :mapParams="encodeAddress(merchant.title,address)"/>
                                <v-card-text>
                                <v-container class="addressdetails fluid mt-n2">
                                    <div class="row d-block d-sm-flex">
                                        <div class="col address" align="justify-content-center">
                                            <h3 class="mb-2">Address:</h3>
                                            <p>{{address.address1}}</p>
                                            <p v-if="address.address2">{{address.address2}}</p>
                                            <p v-if="address.address3">{{address.address3}}</p>
                                            <p>{{address.city}}, {{address.province}}, {{address.country}}</p>
                                            <p>{{address.postalcode}}</p>
                                        </div>
                                        <div class="col hours mt-3-xs" v-if="hours && hours.length">
                                            <h3 class="mb-2">Hours:</h3>
                                            <p v-if="hours[index].status">{{hours[index].status}}</p>
                                            <div v-if="hours[index].hours">
                                            <p class="hour" v-for="hour in hours[index].hours" :key="hour">
                                                {{hour}}
                                            </p>
                                            </div>
                                        </div>
                                    </div>
                                    <v-row>
                                        <v-col class="contact" v-if="address.Contact">
                                            <h3 class="mb-2">Contact Info:</h3>
                                            <v-list-item v-if="address.Contact.email">
                                                <v-list-item-content>
                                                    <v-list-item-title><a :href="'mailto:'+address.Contact.email"><v-icon left>mdi-email</v-icon>{{address.Contact.email}}</a></v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                            <v-list-item v-if="address.Contact.email2">
                                                <v-list-item-content>
                                                    <v-list-item-title><a :href="'mailto:'+address.Contact.email2"><v-icon left>mdi-email</v-icon>{{address.Contact.email2}}</a></v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                            <v-list-item v-if="address.Contact.phone">
                                                <v-list-item-content>
                                                    <v-list-item-title><a :href="'tel:+'+address.Contact.phone"><v-icon left>mdi-phone</v-icon>{{formatPhone(address.Contact.phone)}}</a></v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                            <v-list-item v-if="address.Contact.phone2">
                                                <v-list-item-content>
                                                    <v-list-item-title><a :href="'tel:+'+address.Contact.phone2"><v-icon left>mdi-phone</v-icon>{{formatPhone(address.Contact.phone2)}}</a></v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                        </v-col>
                                        <v-col>
                                        </v-col>
                                    </v-row>
                                </v-container>
                                </v-card-text>
                            </v-card>
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
import Loading from '../components/Loading.vue';
import BasePage from './base/BasePage.page.vue';
import BaseContent from './base/BaseContent.page.vue';
import GoogleMapsEmbed from '../components/GoogleMapsEmbed.vue'
import SocialMediaLinks from '../components/SocialMediaLinks.vue'
import { Utils } from '../utils/util.js';
import { MerchantService } from '../service/Merchant.service';

export default {
    name: 'MerchantDetail',
    props: {
        id: String,
        geoLocation: Object
    },
    components: {
        Loading,
        BasePage,
        BaseContent,
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
            uploadLogoLoading: false,
            uploadedLogo: null,
            editing: false,
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
        formatPhone: function(phone) {
            const formatted = Utils.formatPhoneNumber(phone);
            return formatted ? formatted : phone;
        },
        encodeAddress: function(title,address) {
            if (address.placeid) {
                return encodeURI(`q=place_id:${address.placeid}`);
            }

            const queryStr = 'q=' + title+' '+address.address1 + 
                (address.address2 ? ' ' + address.address2 : '') +
                (address.address3 ? ' '+ address.address3 : '') +
                (address.city ? address.city + ' ' : '') +
                (address.province ? address.province + ' ' : '') +
                (address.postalcode ? address.postalcode + ' ' : '');

            
            return encodeURI(queryStr.replace('&','%26'));
        },
        showUploadDialog: function() {
            this.uploadedLogo = null;
            this.uploadedLogoMerchantId = '';
            this.dialog.title="Upload Logo";
            this.dialog.text=`Upload a png file to set as ${this.merchant.title}'s logo.`;
            this.dialog.yestext="Upload"
            this.dialog.notext="Cancel"
            this.dialog.action = this.uploadLogo;
            this.dialog.show = true;
        },
        uploadLogo: function() {
            this.uploadLogoLoading = true;
            this.$auth.getTokenSilently().then((authToken) => {

                MerchantService.uploadLogo(this.id,authToken,this.uploadedLogo).then(result => {
                    this.makeToast(result,'success');
                }, err => {
                    this.makeToast(err,'danger',5000);
                }).then(() => {
                    this.uploadLogoLoading = false;
                });
            });
        },
        getBusinessHours: function() {
            MerchantService.getBusinessHours(this.id).then(result => {
                if (result) {
                    for (const address of this.merchant.Addresses) {
                        const hours = result.filter(e => e.address_id == address.id);
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
            }, err => {
                console.log(err);
            });
        },
        getLogo: function() {
            MerchantService.getLogo(this.id).then(result => {
                this.logo = result;
            }, () => {
                console.log('Error retrieving logo');
            });
        },
        saveMerchant: function() {
            this.saveMerchantLoading = true;
            this.$auth.getTokenSilently().then((authToken) => {

                MerchantService.saveMerchant(this.id,authToken,this.merchant).then(result => {
                    this.makeToast(result,'success');
                }, err => {
                    this.makeToast(err,'danger');
                }).then(() => {
                    this.saveMerchantLoading = false; 
                    this.editing = false; 
                    this.getMerchant();
                });
            });
        },
        deleteMerchant: function() {
            this.deleteMerchantLoading = true;
            this.$auth.getTokenSilently().then((authToken) => {

                MerchantService.deleteMerchant(this.id,authToken).then(result => {
                    this.makeToast(result,'success');
                    this.getMerchant();
                }, err => {
                    this.makeToast(err,'danger');
                }).then(() => {
                    this.deleteMerchantLoading = false;
                });
            });
        },
        makeToast: function(text, color, timeout=2000) {
            this.snackbar.timeout = timeout;
            this.snackbar.color = color;
            this.snackbar.text = text;
            this.snackbar.show = true;
        },
        getMerchant: function() {
            this.loading = true;
            this.merchant = null;
            MerchantService.getMerchant(this.id).then(result => {
                this.merchant = result;
                this.getBusinessHours();
                this.getLogo();
            }, err => {
                this.error = err;
                if (err.json) {
                    return err.json.then(json => {
                        this.error.message = json.message;
                    });
                }
            }).then(() => {
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
.contact {
    text-align: left;
}
.address {
    text-align: left;
}
.hours h3 {
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