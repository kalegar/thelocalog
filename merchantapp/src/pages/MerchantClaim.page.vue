<template>
    <div class="MerchantClaim">
        <BasePage>
            <template v-slot:header>
            </template>
            <BaseContent>
            <v-container class="mt-3">
                <v-row>
                    <v-col v-if="merchant && !submitted">
                        <v-card>
                        <v-card-title>
                        <h1>Claim {{merchant.title}}</h1>
                        </v-card-title>
                        <img class="logo" :src="'data:image/png;base64,'+logo[0].image" v-if="logo && logo.length"/>
                        <v-card-text>
                        <v-form class="claim-form">
                            <div class="row align-items-center">
                            <div class="col">
                                <v-text-field
                                    label="Email Address"
                                    v-model="form.email"
                                    readonly
                                ></v-text-field>
                            </div>
                            <div class="col">
                                <v-text-field
                                    label="Full Name"
                                    v-model="form.name"
                                    readonly
                                ></v-text-field>
                            </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                <p class="text-muted">Wrong Email or Name? Please edit your details on the Profile page, or login with your account.</p>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                    <v-textarea
                                        label="Claim Details"
                                        v-model="form.text"
                                        placeholder="Please provide details of your proof of ownership"
                                        rows="6"
                                        required
                                        :counter="textAreaMaxLength"
                                        :rules="textAreaRules"
                                    ></v-textarea>
                                </div>
                            </div>
                            <div class="row mt-1">
                                <div class="col">
                                    <v-btn dark color="secondary" @click="onSubmit()">Submit Claim</v-btn>
                                </div>
                            </div>
                        </v-form>
                        </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col v-if="error && error.length">
                        <p>An error occurred.</p>
                        <p>{{error}}</p>
                        <v-btn dark color="secondary" :to="{ name: 'MerchantDetail',  params: { id: merchant.id} }">Go Back</v-btn>
                    </v-col>
                    <v-col v-else-if="submitted">
                        <p>Your claim has been submitted!</p>
                        <v-btn dark color="secondary" :to="{ name: 'Merchants' }">Back To Directory</v-btn>
                    </v-col>
                    <v-overlay :value="loading">
                        <v-progress-circular
                            indeterminate
                            size="64"
                        ></v-progress-circular>
                    </v-overlay>
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

export default {
    name: 'MerchantClaim',
    props: {
        id: String
    },
    components: {
        BasePage,
        BaseContent
    },
    data: function() {
        return {
            merchant: null,
            form: {
                email: '',
                name: ''
            },
            logo: [],
            submitted: false,
            loading: false,
            error: '',
            textAreaMaxLength: 500,
            textAreaRules: [v => v ? (v.length <= 500 || 'Text over character limit will be truncated.') : true]
        }
    },
    methods: {
        onSubmit: function() {
            event.preventDefault();
            const url = `/api/merchants/${this.id}/claims`;
            this.loading = true;
            this.$auth.getTokenSilently().then((authToken) => {
                axios.post(url, { text: this.form.text.substring(0,Math.min(this.form.text.length,this.textAreaMaxLength)), email: this.form.email }, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                })
                .then(res => {
                    this.submitted = true;
                    if (res.status != 201) {
                        this.error = res.statusText;
                    }
                })
                .catch(err => {
                    this.error = err;
                    console.log(err);
                })
                .then(() => this.loading = false);
            }).catch(() => this.loading = false);
        },
        onReset: function() {

        },
        getLogo: function() {
            const url = `/api/merchants/${this.id}/images`;
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
            });
        }
    },
    updated: function() {
        document.title = this.merchant.title ? 'Claim ' + this.merchant.title + ' - The Localog' : 'Claim Local Shop - The Localog';
    },
    mounted: function() {

        this.form.name = this.$auth.user.name;
        this.form.email = this.$auth.user.email;

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
            this.getLogo();
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
}
</script>

<style scoped>
.logo {
    max-height: 200px;
    margin: 2em;
}
</style>