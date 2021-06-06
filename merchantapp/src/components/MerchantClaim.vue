<template>
    <div class="MerchantClaim">
        <BasePage>
            <template v-slot:header>
            </template>
            <BaseContent>
            <div class="container mt-3">
                <div class="row">
                    <div class="col" v-if="merchant && !submitted">
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
                    </div>
                    <div class="col" v-if="submitted">
                        <p>Your claim has been submitted!</p>
                    </div>
                </div>
            </div>
            </BaseContent>
        </BasePage>
    </div>
</template>

<script>
import axios from 'axios';
import BasePage from './BasePage.vue';
import BaseContent from './BaseContent.vue';

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
            submitted: false
        }
    },
    methods: {
        onSubmit: function() {
            event.preventDefault();
            const url = `/api/merchants/${this.id}/claims`;
            this.$auth.getTokenSilently().then((authToken) => {
                axios.post(url, { text: this.form.text, email: this.form.email }, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                })
                .then(res => {
                    this.submitted = true;
                    if (res.status != 201) {
                        console.log('Error creating claim');
                        const error = new Error(res.statusText);
                        throw error;
                    }
                    console.log(res.data);
                })
                .catch(err => {
                    console.log(err);
                });
            });
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
                console.log(res.data);
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
            console.log(this.merchant);
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