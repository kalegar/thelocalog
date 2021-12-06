<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card v-if="suggestions && suggestions.length">
                    <v-card-text>
                    <v-list three-line>
                        <template v-for="(suggestion,index) in suggestions">
                                <v-list-item :key="'suggestion-'+suggestion.id">
                                    <v-list-item-avatar>
                                        <v-icon>mdi-storefront</v-icon>
                                    </v-list-item-avatar>

                                    <v-list-item-content class="suggestion">
                                        <v-list-item-title class="h5">Shop Title: {{suggestion.title}}</v-list-item-title>
                                        <v-list-item-subtitle v-if="suggestion.email">Sent By: {{suggestion.email}}</v-list-item-subtitle>
                                        <v-list-item-subtitle>Suggested Category: {{suggestion.category}}</v-list-item-subtitle>
                                        <v-list-item-subtitle>Extra Info:</v-list-item-subtitle>
                                        <v-list-item-subtitle v-for="(value, name) in suggestion.extraInfo" :key="name"> - {{name}}: {{value}}</v-list-item-subtitle>
                                        <v-list-item-subtitle>Created: {{suggestion.createdAtString}}</v-list-item-subtitle>
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
                    There are no suggestions.
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { MerchantService } from '../service/Merchant.service';

export default {
    name: 'MerchantSuggestions',
    data: function() {
        return {
            suggestions: []
        }
    },
    methods: {
        getSuggestions: function() {
            this.$auth.getTokenSilently().then((authToken) => {
                MerchantService.getMerchantSuggestions(authToken).then(
                    res => {
                        this.suggestions = res.suggestions.map(s => { s.createdAtString = new Date(s.createdAt).toLocaleString(); s.extraInfo = JSON.parse(s.extra); return s });
                    },
                    rej => {
                        console.log(rej);
                    }
                )
            })
            .catch((err) => console.log(err));
        }
    },
    mounted: function() {
        this.getSuggestions();
    }
}
</script>

<style scoped>
.suggestion {
    text-align: left !important;
}
</style>