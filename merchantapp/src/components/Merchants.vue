<template>
    <div class="merchants">
        <BasePage v-on:headerclicked="refreshScreen()">
            <template v-slot:header>
                <SearchBar v-on:search="searchquery = $event; getMerchants()"/>
            </template>
            <BaseContent>
                <template v-slot:left>
                    <div class="sidebar">
                        <MyLocation v-on:location="setGeoLocation($event);"/>
                        <MerchantTags v-on:tags="tags = $event; gotoPage(1)"/>
                        <MerchantCategories v-on:categories="categories = $event; gotoPage(1)"/>
                        <MerchantNeighbourhood v-on:neighbourhood="neighbourhood = $event; gotoPage(1)"/>
                    </div>
                </template>
                <div class="row">
                <div class="merchantlist col" v-if="!$route.params.id">
                    <div v-if="!searchquery" class="row">
                        <div class="col">
                            <h1>Local Shops</h1>
                        </div>
                        <div class="col-2">
                            <b-button-group>
                                <b-button :pressed="merchantLayout == 0" v-on:click="merchantLayout = 0"><b-icon icon="list-ul" ></b-icon></b-button>
                                <b-button :pressed="merchantLayout == 1" v-on:click="merchantLayout = 1"><b-icon icon="columns-gap"></b-icon></b-button>
                            </b-button-group>
                        </div>
                    </div>
                    <div v-else class="row">
                        <div class="col">
                            <h1>Results for '<em>{{searchquery}}</em>'</h1>
                        </div>
                        <div class="col" align="right">
                            <b-button v-on:click="searchquery = ''; getMerchants()">Reset Search</b-button>
                        </div>
                    </div>
                    <Loading :loading="loading && !merchants && !merchants.length"/>
                    <h3 v-if="!loading && merchants && !merchants.length">No Merchants Found!</h3>
                            <b-card-group columns v-if="merchantLayout == 1">
                                <router-link v-for="merchant in merchants" :to="{ name: 'MerchantDetail', params: { id: merchant.id }}" :key="merchant.id">    
                                    <b-card
                                        border-variant="primary"
                                        text-variant="white"
                                        img-alt=""
                                        blank-src="../assets/logo.svg"
                                        class="mb-3 shadow list-item w-100"
                                        no-body
                                    >
                                    <b-card-img
                                        :src="`/api/merchants/${merchant.id}/images/logo`"
                                    >
                                    </b-card-img>
                                    <b-card-footer>{{merchant.title}}</b-card-footer>
                                    </b-card>
                                </router-link>
                            </b-card-group>
                            <b-list-group v-else>
                                <router-link v-for="merchant in merchants" :to="{ name: 'MerchantDetail', params: { id: merchant.id }}" :key="merchant.id">
                                    <b-list-group-item>
                                        <div class="row merchant-list-row">
                                        <div class="col-2 merchant-list-logo-div">
                                            <img class="merchant-list-logo" :src="`/api/merchants/${merchant.id}/images/logo`"/>
                                        </div>
                                        <div class="col">
                                            <h4 class="merchant-list">{{merchant.title}}</h4>
                                            <p class="merchant-list">{{merchant.description}}</p>
                                        </div>
                                        </div>
                                    </b-list-group-item>
                                </router-link>
                            </b-list-group>        
                </div>
                </div>
                <div class="row">
                    <div class="col" align="center">
                    <ul class="pagination justify-content-center mt-2" v-if="pages > 1">
                        <li class="page-item" v-bind:class="{ disabled: page == 1 }"><a class="page-link" href="#" v-on:click="prevPage()">Previous</a></li>
                        <li class="page-item" v-for="n in parseInt(pages)" :key="n" v-bind:class="{ active: page == n }"><a class="page-link" href="#" v-on:click="gotoPage(n)">{{n}}</a></li>
                        <li class="page-item" v-bind:class="{ disabled: page == pages }"><a class="page-link" href="#" v-on:click="nextPage()">Next</a></li>
                    </ul>
                    </div>
                </div>
                <p v-if="error">
                    An error occurred.
                </p>
                <template v-slot:right>
                    <div class="dropdown sidebar">
                        <b-dropdown id="itemsperpage" :text="perpage + ' Results Per Page'" class="m-md-2">
                            <b-dropdown-item v-on:click="perpage = 10">10</b-dropdown-item>
                            <b-dropdown-item v-on:click="perpage = 25">25</b-dropdown-item>
                            <b-dropdown-item v-on:click="perpage = 50">50</b-dropdown-item>
                        </b-dropdown>
                    </div>
                </template>
            </BaseContent>
        </BasePage>
  </div>
</template>

<script>
import axios from 'axios';
import Loading from './Loading.vue'
import BasePage from './BasePage.vue'
import BaseContent from './BaseContent.vue'
import SearchBar from './SearchBar.vue'
import MerchantCategories from './MerchantCategories.vue'
import MerchantTags from './MerchantTags.vue'
import MerchantNeighbourhood from './MerchantNeighbourhood.vue'
import MyLocation from './MyLocation.vue'

export default {
    name: 'Merchants',
    props: {
    },
    watch: {
        "perpage": function(newVal) {
            localStorage.merchantsPerPage = newVal;
            this.getMerchants();
        }
    },
    components: {
        BasePage,
        BaseContent,
        SearchBar,
        Loading,
        MerchantCategories,
        MerchantTags,
        MerchantNeighbourhood,
        MyLocation
    },
    data: function() {
        return {
            loading: false,
            error: null,
            merchants: [],
            page: 1,
            pages: 1,
            perpage: 10,
            searchquery: '',
            categories: [],
            tags: [],
            neighbourhood: '',
            geoLocation: {},
            geoRadius: 10000,
            useGeoLocation: false,
            merchantLayout: 0
        }
    },
    methods: {
        merchantClick: function(id) {
            this.$router.push({ path: `/merchants/${id}`});
        },
        backClick: function() {
            history.back();
        },
        nextPage: function() {
            this.page += 1;
            this.getMerchants();
        },
        prevPage: function() {
            this.page -=1;
            this.getMerchants();
        },
        gotoPage: function(pagenum) {
            this.page = pagenum;
            this.getMerchants();
        },
        refreshScreen: function() {
            this.page = 1;
            this.searchquery = '';
            this.getMerchants();
        },
        getLogo: function(id) {
            axios.get(`/api/merchants/${id}/images/logo`)
            .then(res => {
                if (res.status != 200) {
                    return '../assets/placeholder.png';
                }
                return `/api/merchants/${id}/images/logo`;
            });
        },
        setGeoLocation : function(location) {
            const { enabled, position, radius } = location;
            this.useGeoLocation = enabled;
            if (enabled) {
                console.log(position.coords.latitude, position.coords.longitude);  
                this.geoLocation = position.coords;
                this.geoRadius = radius * 1000;
            }
            this.gotoPage(1);
        },
        getMerchants: function() {
            this.loading = true;

            let params = {
                'details': true,
                'page': this.page,
                'perpage': this.perpage
            }

            if (this.tags && this.tags.length > 0) {
                params.tags = this.tags.join(" ");
            }

            if (this.categories && this.categories.length > 0) {
                params.categories = this.categories.join("+");
            }

            if (this.neighbourhood && this.neighbourhood.length > 0) {
                params.neighbourhood = this.neighbourhood;
            }

            if (this.searchquery) {
                params.search = this.searchquery;
            }

            if (this.useGeoLocation && this.geoLocation.latitude && this.geoLocation.longitude) {
                params.lat = this.geoLocation.latitude;
                params.lon = this.geoLocation.longitude;
                if (this.geoRadius) {
                    params.radius = this.geoRadius;
                }
            }

            axios.get('/api/merchants', {
                params
            })
            .then(res => {
                if (res.status != 200) {
                    console.log('ERROR');
                    const error = new Error(res.statusText);
                    throw error;
                }
                // const tempMerchants = res.data.merchants.rows;
                // for (let i = this.merchants.length-1; i >= 0; i--) {
                //     if (tempMerchants.filter(e => e.id === this.merchants[i].id).length == 0) {
                //         this.merchants.splice(i,1);
                //     }
                // }
                // tempMerchants.map(e => {
                //     if (this.merchants.filter(m => m.id === e.id).length == 0) {
                //         this.merchants.push(e);
                //     }
                // })
                //const tempMerchants = res.data.merchants.rows;
                //this.merchants = tempMerchants.map(m => m.nologo = false);
                this.merchants = res.data.merchants.rows;
                this.pages = Math.ceil(res.data.merchants.count / this.perpage);
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
    },
    updated: function() {
        document.title = 'Directory - The Localog';
    },
    mounted: function() {

        this.getMerchants();

        if (localStorage.merchantsPerPage) {
            this.perpage = localStorage.merchantsPerPage;
        }

        let vm = this;

        window.onpopstate = function(event) {
            if (event.state) {
                vm.selected = event.state.selected;
            }
        }
    }
}
</script>

<style scoped>
.card-footer {
    background-color: #001E48 !important;
    font-size: 24px;
}
.shop-header-link {
    color: white;
    margin-left: 1rem;
}
.shop-content {
    margin: 1rem;
}
.shop-link {
    margin-left: 0.5rem;
}
h1,h3{
  text-align: left;
  margin-bottom: 1rem;
}
.merchantlist {
    margin-top: 2rem;
    margin-left: 2rem;
    margin-right: 2rem;
    width: 100%;
}
.merchantitems {
    height: 74vh;
    overflow-y: scroll;
    overflow-x: clip;
}
.list-item {
  display: inline-block;
  transition: opacity 0.5s
}
.list-item:hover {
    opacity: 0.5;
}
.list-enter-active, .list-leave-active {
  transition: opacity 1s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.sidebar {
    margin: 1rem 3rem 1rem 3rem;
}
.merchant-list-logo {
    max-width: 128px;
    float: left;
}
.merchant-list-row {
    padding-top: 8px;
    padding-bottom: 8px;
}
h4.merchant-list, p.merchant-list {
    text-align: left;
}
</style>