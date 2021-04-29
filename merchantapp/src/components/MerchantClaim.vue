<template>
    <div class="MerchantClaim">
        <BasePage>
            <template v-slot:header>
            </template>
            <BaseContent>
            <div class="container mt-3">
                <div class="row">
                    <div class="col" v-if="merchant">
                        <h1>Claim {{merchant.title}}</h1>
                        <img class="logo" :src="'data:image/png;base64,'+logo[0].image" v-if="logo && logo.length"/>
                        <b-form @submit="onSubmit" @reset="onReset" class="claim-form">
                            <div class="row align-items-center">
                            <div class="col">
                                <b-form-group
                                    id="input-group-1"
                                    label="Email address:"
                                    label-for="input-1"
                                >
                                    <b-form-input
                                    id="input-1"
                                    v-model="form.email"
                                    type="email"
                                    placeholder="Enter email"
                                    required
                                    readonly
                                    ></b-form-input>
                                </b-form-group>
                            </div>
                            <div class="col">
                                <b-form-group id="input-group-2" label="Your Name:" label-for="input-2">
                                    <b-form-input
                                    id="input-2"
                                    v-model="form.name"
                                    placeholder="Enter name"
                                    required
                                    readonly
                                    ></b-form-input>
                                </b-form-group>
                            </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                <p class="text-muted">Wrong Email or Name? Please edit your details on the Profile page, or login with your account.</p>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                    <b-button type="submit" variant="primary">Submit Claim</b-button>
                                </div>
                            </div>
                        </b-form>
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
            logo: []
        }
    },
    methods: {
        onSubmit: function() {

        },
        onReset: function() {

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
                console.log(res.data);
                this.logo = res.data;
            })
            .catch(err => {
                console.log(err);
            })
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