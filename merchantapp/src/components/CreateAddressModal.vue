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
            >
                <v-icon>mdi-plus</v-icon>
                Add Location
            </v-btn>
        </template>
        <v-card>
            <v-card-title>
                <span class="text-h5">Add Location</span>
            </v-card-title>
            <v-card-text>
                <v-form v-model="valid" ref="form">
                <v-container>
                    <v-row>
                        <v-col>
                            <v-text-field class="mt-2" color="secondary" label="Address Line 1" v-model="address1" :rules="[rules.required]" required></v-text-field>
                            <v-expand-transition>
                            <v-text-field class="mt-2" v-show="address1.length" color="secondary" label="Address Line 2" v-model="address2"></v-text-field>
                            </v-expand-transition>
                            <v-expand-transition>
                            <v-text-field class="mt-2" v-show="address2.length" color="secondary" label="Address Line 3" v-model="address3"></v-text-field>
                            </v-expand-transition>
                            <v-text-field class="mt-2" color="secondary" label="City" v-model="city" :rules="[rules.required]" required></v-text-field>
                            <v-select class="mt-2" color="secondary" v-model="province" :items="provinces" item-text="prov" item-value="abbr" label="Province" :rules="[rules.required]" required></v-select>
                            <v-text-field class="mt-2" color="secondary" v-model="country" maxlength="2" counter label="Country" :rules="[rules.required]" required></v-text-field>
                            <v-text-field class="mt-2" color="secondary" v-model="postalcode" maxlength="20" counter label="Postal Code" :rules="[rules.required]" required></v-text-field>
                            <v-text-field class="mt-2" color="secondary" v-model="neighbourhood" maxlength="70" counter label="Neighbourhood"></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
                </v-form>
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
                    :disabled="!valid"
                    @click="save()"
                >
                Create
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
    name: 'CreateAddressModal',
    data: function() {
        return {
            valid: false,
            dialog: false,
            saving: false,
            rules: {
                required: value => !!value || 'Required.',
            },
            address1: '',
            address2: '',
            address3: '',
            city: 'Edmonton',
            province: 'AB',
            country: 'CA',
            postalcode: '',
            neighbourhood: '',
            provinces: [
                {prov: 'Alberta', abbr: 'AB'},
                {prov: 'British Columbia', abbr: 'BC'},
                {prov: 'Manitoba', abbr:'MB'},
                {prov: 'New Brunswick', abbr: 'NB'},
                {prov: 'Newfoundland and Labrador', abbr: 'NL'},
                {prov: 'Northwest Territories', abbr: 'NT'},
                {prov: 'Nova Scotia', abbr:'NS'},
                {prov: 'Nunavut', abbr:'NU'},
                {prov: 'Ontario', abbr:'ON'},
                {prov: 'Prince Edward Island', abbr:'PE'},
                {prov: 'Quebec', abbr:'QC'},
                {prov: 'Saskatchewan', abbr: 'SK'},
                {prov: 'Yukon', abbr: 'YT'}
            ],
        }
    },
    props: {
        merchantId: String
    },
    methods: {
        cancel: function() {
            this.dialog = false;
            this.valid = false;
            this.address1 = '';
            this.address2 = '';
            this.address3 = '';
            this.city = 'Edmonton',
            this.province = 'AB',
            this.country = 'CA',
            this.postalcode = '',
            this.neighbourhood = ''
            this.saving = false;
            this.$refs.form.resetValidation();
        },
        save: function() {
            this.saving = true;
            this.$auth.getTokenSilently().then((authToken) => {
                let addr = this.address1 + (this.address2.length ? `\n${this.address2}` : '') + (this.address3.length ? `\n${this.address3}` : '');
                MerchantService.createAddress(this.merchantId,{
                    address: addr,
                    city: this.city,
                    province: this.province,
                    country: this.country,
                    postalcode: this.postalcode,
                    neighbourhood: this.neighbourhood
                },authToken).then(result => {
                    if (result.merchant && result.merchant.id) {
                        this.$emit('created');
                    }
                }, err => {
                    this.$emit('error',err);
                }).then(() => {this.cancel()});
            }).catch(() => {this.saving = false;});
        }
    }
}
</script>