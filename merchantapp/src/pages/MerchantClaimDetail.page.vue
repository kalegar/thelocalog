<template>
    <base-page>
        <base-content>
            <v-container>
                <v-row>
                    <v-col>
                        <h1 v-if="claim == null">Review Claim</h1>
                        <h1 v-else>Review Claim for {{claim.Merchant.title}}</h1>
                    </v-col>
                </v-row>
                <v-row v-if="claim !== null">
                    <v-col>
                        <v-card>
                            <v-card-title>
                                Claim Details
                            </v-card-title>
                            <v-card-text>
                                <p>Merchant: {{ claim.Merchant.title }}</p>
                                <p>User: {{claim.email}}</p>
                                <p>Claim Text: {{claim.text}}</p>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn @click="denyClaim">Deny</v-btn>
                                <v-btn @click="approveClaim">Approve</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </base-content>
    </base-page>
</template>

<script lang="ts">
import BaseContent from './base/BaseContent.page.vue';
import BasePage from './base/BasePage.page.vue';
import { AdminService } from '../service/Admin.service.js';

import Vue from 'vue'
export default Vue.extend({
  components: { BasePage, BaseContent },
    name: 'MerchantClaimDetail',
    props: {
        id: String
    },
    data: function() {
        return {
            claim: null
        }
    },
    methods: {
        getClaim: function() {
            this.$auth.getTokenSilently().then((authToken) => {
                AdminService.getMerchantClaim(this.id,authToken).then((res) => {
                    this.claim = res.claim;
                }, err => {
                    console.log(err);
                });
            });
        },
        denyClaim: function() {
            this.$auth.getTokenSilently().then((authToken) => {
                AdminService.denyClaim(this.id,authToken).then(() => {
                    this.$router.push({
                            name: 'AdminHome',
                        });
                }, err => {
                    console.log(err);
                });
            });
        },
        approveClaim: function() {
            this.$auth.getTokenSilently().then((authToken) => {
                AdminService.approveClaim(this.id,authToken).then( ()=> {
                    this.$router.push({
                            name: 'AdminHome',
                        });
                }, err => {
                    console.log(err);
                });
            });
        }
    },
    mounted: function() {
        this.getClaim();
    }
});
</script>