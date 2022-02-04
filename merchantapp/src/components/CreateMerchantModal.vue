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
                        <v-text-field color="secondary" outlined label="Title" :rules="[rules.required]" v-model="title"></v-text-field>
                    </v-row>
                    <v-row>
                        <v-textarea
                            v-model="description"
                            outlined
                            label="Description"
                            color="secondary"
                        ></v-textarea>
                    </v-row>
                    <v-row>
                        <v-text-field
                            v-model="website"
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
            title: '',
            description: '',
            website: ''
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
        }
    },
    methods: {
        cancel: function() {
            this.dialog = false;
            this.title = '';
            this.description = '';
            this.website = '';
            this.saving = false;
        },
        save: function() {
            this.saving = true;
            this.$auth.getTokenSilently().then((authToken) => {
                MerchantService.createMerchant({
                    title: this.title,
                    description: this.description,
                    website: this.website
                },authToken).then(result => {
                    console.log(result);
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