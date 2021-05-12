<template>
    <div class="AdminHome">
        <BasePage>
            <template v-slot:header>
            </template>
            <BaseContent>
            <div class="container mt-3" v-if="isAdmin">
                <div class="row">
                    <div class="col">
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
    name: 'AdminHome',
    components: {
        BasePage,
        BaseContent
    },
    data: function() {
        return {
            claims: [],
            isAdmin: false
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
    }
}
</script>

<style scoped>
</style>