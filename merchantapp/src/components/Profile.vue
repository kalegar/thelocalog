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
                        <b-form @submit="onSubmit" @reset="onReset" class="row align-items-center profile-form">
                            <div class="col-md-2 mb-3">
                                <img
                                :src="$auth.user.picture"
                                alt="User's profile picture"
                                class="rounded-circle img-fluid profile-picture"
                                />
                            </div>
                            <div class="col-md text-center text-md-left">
                            <b-form-group
                                id="input-group-1"
                                label="Email address:"
                                label-for="input-1"
                                description="We'll never share your email with anyone else."
                            >
                                <b-form-input
                                id="input-1"
                                v-model="form.email"
                                type="email"
                                placeholder="Enter email"
                                required
                                :readonly="!editing"
                                ></b-form-input>
                            </b-form-group>
                            <b-form-group id="input-group-2" label="Your Name:" label-for="input-2">
                                <b-form-input
                                id="input-2"
                                v-model="form.name"
                                placeholder="Enter name"
                                required
                                :readonly="!editing"
                                ></b-form-input>
                            </b-form-group>
                            <div class="profile-buttons" v-if="canEditProfile">
                                <div class="edit-buttons" v-show="!editing">
                                    <b-button variant="primary" v-on:click="editing = !editing">Edit</b-button>
                                </div>
                                <div class="submit-buttons" v-show="editing">
                                    <b-button type="reset" variant="primary">Cancel</b-button>
                                    <b-button type="submit" variant="primary">Save</b-button>
                                </div>
                            </div>
                            </div>
                            <!-- <div class="col-md text-center text-md-left">
                                <h2>{{ $auth.user.name }}</h2>
                                <p class="lead text-muted">{{ $auth.user.email }}</p>
                            </div> -->
                        </b-form>
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
import BasePage from './BasePage.vue';
import BaseContent from './BaseContent.vue';
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
                axios.patch('/api/user/profile',this.form,{
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }).then(res => {
                    console.log(res);
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
            console.log(this.$auth.user);
            axios.get('/api/user/merchants', {
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