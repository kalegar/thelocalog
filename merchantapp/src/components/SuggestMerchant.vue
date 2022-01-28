<template>
    <v-dialog
        v-model="dialog"
        persistent
        max-width="600px"
    >
        <template v-slot:activator="{ on, attrs }">
            <slot v-bind:on="on" v-bind:attrs="attrs">
                <v-btn
                    color="secondary"
                    v-on="on"
                    v-bind="attrs"
                >Suggest a Shop</v-btn>
            </slot>
        </template>

        <v-card>

            <v-card-title>
                <span class="text-h5">{{title}}</span>
            </v-card-title>

            <v-card-text>
                <v-form v-model="valid" ref="form">
                    <v-container>
                        <v-row>
                            <v-col>
                                <p class="text-subtitle">Are we missing a local shop? Please provide details about the shop so we can add it to our collection.</p>
                            </v-col>
                        </v-row>
                        <v-row class="mt-0">
                            <v-col>
                                <v-text-field
                                    v-model="name"
                                    color="secondary"
                                    label="Shop Name"
                                    :rules="[rules.required]"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-select
                                    v-model="category"
                                    :items="categories"
                                    color="secondary"
                                    label="Category"
                                    :menu-props="menuProps"
                                ></v-select>
                                <v-text-field
                                    v-model="otherCategory"
                                    color="secondary"
                                    label="Please Specify Other Category"
                                    :rules="[rules.required]"
                                    v-if="category == 'Other'"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-text-field
                                    v-model="address"
                                    color="secondary"
                                    label="Address"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-text-field
                                    v-model="email"
                                    color="secondary"
                                    label="Your E-Mail Address"
                                    :rules="[rules.required, rules.validEmail]"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="secondary"
                    @click="cancel"
                >Cancel</v-btn>
                <v-btn
                    color="secondary"
                    @click="submit"
                >Submit</v-btn>
            </v-card-actions>

        </v-card>


    </v-dialog>
</template>

<script>
import {MerchantService} from '../service/Merchant.service';

export default {
    name: 'SuggestMerchant',

    props: {
        title: {
            type: String,
            default: 'Suggest a Shop'
        }
    },

    computed: {
      menuProps: function() {
        return this.$vuetify.breakpoint.mobile ? { offsetY: true, offsetOverflow: true, maxHeight: '200px' } : { offsetY: true, offsetOverflow: true };
      }
    },

    data: function() {
        return {
            dialog: false,

            name: '',
            category: '',
            otherCategory: '',
            categories: ['Other'],
            address: '',
            email: '',

            valid: false,
            rules: {
                required: v => !!v || 'Required',
                validEmail: v => /.+@.+\..+/.test(v) || 'E-mail must be valid'
            }
        }
    },

    methods: {
        cancel: function() {
            this.clearForm();
            this.dialog = false;
        },
        submit: function() {
            this.$refs.form.validate();
            if (this.valid) {
                if (this.category == 'Other' && this.otherCategory.length)
                    this.category = this.otherCategory;
                this.$emit('submit',{name: this.name, category: this.category, address: this.address, email: this.email});
                this.clearForm();
                this.dialog = false;
            }
        },
        clearForm: function() {
            this.$refs.form.resetValidation();
            this.name = '';
            this.category = '';
            this.otherCategory = '';
            this.address = '';
            //Don't clear out the email address.
        },
        loadCategories: function() {
            MerchantService.getCategories(true,'merchants')
            .then((res) => {
                this.categories = [...res, 'Other'];
            },() => {});
        }
    },

    mounted: function() {
        this.loadCategories();
    }
}
</script>