<template>
    <v-card v-if="loading">
        <v-card-text>
            <v-progress-circular indeterminate color="secondary"></v-progress-circular>
        </v-card-text>
    </v-card>
    <v-card v-else-if="claims && claims.length">
        <v-card-text>
        <v-list three-line>
            <template v-for="(claim,index) in claims">
                    <v-list-item :to="{ name: 'ClaimDetail', params: { id: claim.id.toString() }}" :key="'claim-'+claim.id">
                        <v-list-item-avatar>
                            <v-icon>mdi-storefront</v-icon>
                        </v-list-item-avatar>

                        <v-list-item-content class="merchant-list-item">
                            <v-list-item-title class="h5">{{claim.Merchant.title}}</v-list-item-title>
                            <v-list-item-subtitle v-if="claim.email">{{claim.email}}</v-list-item-subtitle>
                            <v-list-item-subtitle>{{claim.text}}</v-list-item-subtitle>
                            <v-list-item-subtitle>{{claim.createdAt}}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                <v-divider
                :key="index"
                class="mx-4"
                ></v-divider>
            </template>
        </v-list>
        </v-card-text>
    </v-card>
    <v-card v-else>
        <v-card-text>
        There are no claims.
        </v-card-text>
    </v-card>
</template>

<script>
import { AdminService } from '../service/Admin.service';
export default {
    name: 'MerchantClaims',
    data: function() {
        return {
            loading: false,
            claims: [],
            deleting: false,
            deleteDialog: false,
            toDelete: {}
        }
    },
    methods: {
        getClaims: function() {
            this.loading = true;
            this.$auth.getTokenSilently().then((authToken) => {
                AdminService.getMerchantClaims(authToken).then(
                    res => {
                        this.claims = res.map(s => { s.active = false; return s });
                    },
                    rej => {
                        console.log(rej);
                    }
                ).finally(() => {this.loading = false});
            })
            .catch((err) => console.log(err));
        }
    },
    mounted: function() {
        this.getClaims();
    }
}
</script>