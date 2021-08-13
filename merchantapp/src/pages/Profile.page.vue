<template>
    <div class="Profile">
        <BasePage>
            <template v-slot:header>
            </template>
            <BaseContent>
                    <div class="container mt-3">
                        <div class="row">
                            <h1>Profile</h1>
                        </div>
                        <v-form @submit="onSubmit" @reset="onReset" class="row align-items-center profile-form">
                            <div class="col-md-2 mb-3">
                                <img
                                :src="$auth.user.picture"
                                alt="User's profile picture"
                                class="rounded-circle img-fluid profile-picture"
                                />
                            </div>
                            <div class="col-md text-center text-md-left">
                                <v-text-field
                                    v-model="form.email"
                                    required
                                    label="Email Address"
                                    :readonly="!editing"
                                ></v-text-field>
                                <v-text-field
                                    v-model="form.name"
                                    required
                                    label="Full Name"
                                    :readonly="!editing"
                                ></v-text-field>
                            <div class="profile-buttons" v-if="canEditProfile">
                                <div class="edit-buttons" v-show="!editing">
                                    <v-btn color="secondary" dark v-on:click="editing = !editing">Edit</v-btn>
                                </div>
                                <div class="submit-buttons" v-show="editing">
                                    <v-btn type="reset" color="secondary" dark>Cancel</v-btn>
                                    <v-btn type="submit" color="secondary" dark>Save</v-btn>
                                </div>
                            </div>
                            </div>
                            <!-- <div class="col-md text-center text-md-left">
                                <h2>{{ $auth.user.name }}</h2>
                                <p class="lead text-muted">{{ $auth.user.email }}</p>
                            </div> -->
                        </v-form>
                        <div class="row mt-3" v-if="myMerchants && myMerchants.length">
                            <h1>My Merchants</h1>
                            <!-- <highlightjs autodetect :code="JSON.stringify($auth.user, null, 2)" class="rounded w-100" /> -->
                        </div>
                    </div>
            </BaseContent>
        </BasePage>
    </div>
</template>

<script>
import BasePage from './base/BasePage.page.vue';
import BaseContent from './base/BaseContent.page.vue';
import axios from 'axios';

export default {
    name: 'Profile',
    components: {
        BasePage,
        BaseContent
    },
    data: function() {
        return {
            editing: false,
            canEditProfile: false,
            form: {
                email: '',
                name: ''
            },
            myMerchants: []
        }
    },
    methods: {
        onSubmit: function() {
            this.editing = false;
            this.$auth.getTokenSilently().then((authToken) => {
                axios.patch('/api/users/profile',this.form,{
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }).then(() => {
                    location.reload();
                }).catch(err => {
                    console.log(err);
                    this.onReset();
                })
            });
        },
        onReset: function() {
            event.preventDefault();
            this.form.email = this.$auth.user.email;
            this.form.name  = this.$auth.user.name;
            this.editing = false;
        }
    },
    mounted: function() {

        this.form.email = this.$auth.user.email;
        this.form.name  = this.$auth.user.name;
        this.canEditProfile = this.$auth.user.sub.startsWith('auth0|');

        this.$auth.getTokenSilently().then((authToken) => {

            axios.get(`/apis`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            .catch(err => {
                if (err.json) {
                    console.log(err.json);
                }
            });

            axios.get('/api/users/merchants', {
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
                if (res.data.merchants) {
                    this.myMerchants = res.data.merchants;
                }
            })
            .catch(err => {
                if (err.json) {
                    console.log(err.json);
                }
            });
        });
        
    }
}
</script>

<style scoped>

</style>