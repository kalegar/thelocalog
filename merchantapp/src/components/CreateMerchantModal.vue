<template>
    <v-dialog
        v-model="dialog"
        persistent
        max-width="600px"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                v-bind="attrs"
                v-on="on"
                :fab="fab"
                :class="buttonClass"
                :small="small"
            >
                <v-icon>mdi-plus</v-icon>
                {{text}}
            </v-btn>
        </template>
        <v-card>
            <v-card-title>
                <span class="text-h5">Create Merchant</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-text-field color="secondary" outlined label="Title" :rules="[rules.required]" v-model="internalTitle"></v-text-field>
                    </v-row>
                    <v-row>
                        <v-textarea
                            v-model="internalDescription"
                            outlined
                            label="Description"
                            color="secondary"
                        ></v-textarea>
                    </v-row>
                    <v-row>
                        <v-text-field
                            v-model="internalWebsite"
                            outlined
                            label="Website"
                            color="secondary"
                        ></v-text-field>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="red"
                    text
                    @click="cancel()"
                >
                Cancel
                </v-btn>
                <v-btn
                    color="green"
                    text
                    @click="save()"
                >
                Save
                </v-btn>
            </v-card-actions>
            <v-overlay :value="saving">
                <v-progress-circular
                    indeterminate
                    size="64"
                >
                </v-progress-circular>
            </v-overlay>
        </v-card>
    </v-dialog>
</template>

<script>
import { MerchantService } from '../service/Merchant.service';

export default {
    name: 'CreateMerchantModal',
    data: function() {
        return {
            dialog: false,
            saving: false,
            rules: {
                required: value => !!value || 'Required.',
            },
            internalTitle: '',
            internalDescription: '',
            internalWebsite: ''
        }
    },
    props: {
        fab: {
            type: Boolean,
            default: false
        },
        text: {
            type: String,
            default: 'Create Merchant'
        },
        'button-class': {
            type: String,
            default: ''
        },
        small: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
        website: {
            type: String,
            default: ''
        }
    },
    watch: {
        title: {
            immediate: true,
            handler: function() {
                this.internalTitle = this.title;
            }
        },
        description: {
            immediate: true,
            handler: function() {
                this.internalDescription = this.description;
            }
        },
        website: {
            immediate: true,
            handler: function() {
                this.internalWebsite = this.website;
            }
        }
    },
    methods: {
        cancel: function() {
            this.dialog = false;
            this.internalTitle = this.title;
            this.internalDescription = this.description;
            this.internalWebsite = this.website;
            this.saving = false;
        },
        save: function() {
            this.saving = true;
            this.$auth.getTokenSilently().then((authToken) => {
                MerchantService.createMerchant({
                    title: this.internalTitle,
                    description: this.internalDescription,
                    website: this.internalWebsite
                },authToken).then(result => {
                    if (result.merchant && result.merchant.id) {
                        this.$router.push({
                            name: 'MerchantDetail',
                            params: { merchantId: result.merchant.id },
                        });
                    }
                }, err => {
                    console.log(err);
                }).then(() => {this.cancel()});
            }).catch(() => {this.saving = false;});
        }
    }
}
</script>