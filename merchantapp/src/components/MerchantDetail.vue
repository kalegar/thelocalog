<template>
    <div class="MerchantDetail">
        <BasePage>
            <template v-slot:header>
                <SearchBar/>
            </template>
            <BaseContent>
                    <div class="merchant" v-if="!loading && merchant">
                        <h1>{{merchant.title}}</h1>
                        <p>{{merchant.description}}</p>
                        <a v-if="merchant.website" :href="merchant.website">{{merchant.website}}</a>
                        <div class="addresses" v-if="merchant.Addresses">
                            <h2 v-if="merchant.Addresses.length > 1">Locations:</h2>
                            <h2 v-if="merchant.Addresses.length == 1">Location:</h2>
                            <div class="addresscard card" v-for="(address, index) in merchant.Addresses" :key="address.id">
                                <GoogleMapsEmbed :mapParams="encodeAddress(merchant.title,address)"/>
                                <div class="addressdetails container fluid">
                                    <div class="row">
                                        <div class="col address" align="justify-content-center">
                                        <h4>Address:</h4>
                                        <p>{{address.address1}}</p>
                                        <p v-if="address.address2">{{address.address2}}</p>
                                        <p v-if="address.address3">{{address.address3}}</p>
                                        <p>{{address.city}}, {{address.province}}, {{address.country}}</p>
                                        <p>{{address.postalcode}}</p>
                                        </div>
                                        <div class="col hours" v-if="hours && hours.length">
                                            <h4>Hours:</h4>
                                            <p class="hour" v-for="hour in hours[index]" :key="hour">
                                                {{hour}}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Loading :loading="loading"/>
            </BaseContent>
        </BasePage>
    </div>
</template>

<script>
import axios from 'axios';
import Loading from './Loading.vue';
import BasePage from './BasePage.vue';
import BaseContent from './BaseContent.vue';
import SearchBar from './SearchBar.vue';
import GoogleMapsEmbed from './GoogleMapsEmbed.vue'

export default {
    name: 'MerchantDetail',
    props: {
        id: String
    },
    components: {
        Loading,
        BasePage,
        BaseContent,
        SearchBar,
        GoogleMapsEmbed
    },
    data: function() {
        return {
            merchant: null,
            loading: false,
            hours: [],
            error: null
        }
    },
    methods: {
        encodeAddress: function(title,address) {
            return encodeURI('q=' + title+' '+address.address1 + 
                (address.address2 ? ' ' + address.address2 : '') +
                (address.address3 ? ' '+ address.address3 : '') +
                (address.city ? address.city + ' ' : '') +
                (address.province ? address.province + ' ' : '') +
                (address.postalcode ? address.postalcode + ' ' : '')
            );
        },
        getBusinessHours: function() {
            const url = `/api/merchants/${this.id}/hours`
            axios.get(url)
            .then(res => {
                if (res.status != 200) {
                    console.log('getBusinessHours() Error');
                    const error = new Error(res.statusText);
                    throw error;
                }
                if (res.data.data) {
                    for (const address of this.merchant.Addresses) {
                        const hours = res.data.data.filter(e => e.address_id == address.id);
                        if (hours.length > 0) {
                            this.hours.push(hours[0].hours);
                        }
                    }
                }
            })
            .catch(err => {
                console.log(err);
            })
        }
    },
    mounted: function() {
        this.loading = true;

        const url = `/api/merchants/${this.id}`
        axios.get(url, {
            params: {
                'details': true,
                'address': true
            }
        })
        .then(res => {
            if (res.status != 200) {
                console.log('ERROR');
                const error = new Error(res.statusText);
                throw error;
            }
            this.merchant = res.data.merchant;
            this.getBusinessHours();
        })
        .catch(err => {
            this.error = err;
            if (err.json) {
                return err.json.then(json => {
                    this.error.message = json.message;
                });
            }
        })
        .then(() => {
            this.loading = false;
        })
    }
}
</script>

<style scoped>
h2 {
    text-align: left;
}
.addresses {
    margin-top: 16px;
}
.addressdetails {
    margin-top: 1rem;
}
.addresscard {
    margin-bottom: 1rem;
    margin-left: 1rem;
    margin-right: 1rem;
    padding-bottom: 1rem;
}
.merchant {
    margin-top: 24px;
}
.address {
    text-align: left;
}
.hours h4 {
    text-align: left;
    
}
.hour {
    text-align: left;
    margin-left: 1rem;
    margin-bottom: 0;
}
.address p {
    margin-bottom: 0;
    margin-left: 1rem;
}
</style>