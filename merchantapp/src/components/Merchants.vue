<template>
    <div class="merchants">
        <BasePage v-on:headerclicked="refreshScreen()">
            <template v-slot:header>
                <SearchBar v-on:search="searchFilters.searchquery = $event; getMerchants()"/>
            </template>
            <BaseContent>
                <template v-slot:left>
                    <div class="mt-3 sidebar">
                        <MyLocation v-on:location="setGeoLocation($event);"/>
                        <MerchantTags v-on:tags="searchFilters.tags = $event"/>
                        <MerchantCategories v-on:categories="searchFilters.categories = $event"/>
                        <MerchantNeighbourhood v-on:neighbourhood="searchFilters.neighbourhood = $event"/>
                    </div>
                </template>
                <div class="row">
                <div class="merchantlist col">
                    <div  class="row">
                        <div v-if="!searchFilters.searchquery" class="col">
                            <h1>Local Shops</h1>
                        </div>
                        <div v-else class="col">
                            <h1>Results for '<em>{{searchFilters.searchquery}}</em>'</h1>
                        </div>
                        <div class="d-none d-sm-block col-sm-2">
                            <b-button-group>
                                <b-button :pressed="merchantLayout == 0" v-on:click="merchantLayout = 0"><b-icon icon="list-ul" ></b-icon></b-button>
                                <b-button :pressed="merchantLayout == 1" v-on:click="merchantLayout = 1"><b-icon icon="columns-gap"></b-icon></b-button>
                            </b-button-group>
                        </div>
                    </div>
                    <Loading :loading="loading && 1==2"/>
                    <h3 v-if="!loading && merchants && !merchants.length">No Merchants Found!</h3>
                    <div v-if="merchantLayout == 1">
                        <transition name="fade" mode="out-in">
                        <div v-if="loading" key="skeleton">
                            <b-card-group columns>
                            <b-card v-for="n in 12" v-bind:key="n" border-variant="primary"
                                    text-variant="white" no-body img-top>
                                <b-skeleton-img animation="fade" card-img="top" no-aspect :id="n" :height="((n % 3) * 64 + 64).toString() +  'px'"></b-skeleton-img>
                                <b-card-body>
                                    <b-skeleton width="90%" height="2em"></b-skeleton>
                                </b-card-body>
                            </b-card>
                            </b-card-group>
                        </div>
                        <div v-else key="merchants">
                        <b-card-group columns>
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
                        </div>
                        </transition>
                    </div>
                    <div v-if="merchantLayout == 0">
                        <transition name="fade" mode="out-in">
                        <div v-if="loading" key="list-skeleton">
                            <b-card v-for="n in 3" v-bind:key="n">
                                <b-row>
                                    <b-col cols="2">
                                        <b-skeleton-img no-aspect width="128px" height="128px" :id="n"></b-skeleton-img>
                                    </b-col>
                                    <b-col>
                                        <div style="text-align:left;">
                                        <b-skeleton animation="fade" width="20%" height="1.5em"></b-skeleton>
                                        <b-skeleton animation="fade" width="55%"></b-skeleton>
                                        <b-skeleton animation="fade" width="70%"></b-skeleton>
                                        <b-skeleton animation="fade" width="60%"></b-skeleton>
                                        <b-skeleton animation="fade" width="45%"></b-skeleton>
                                        </div>
                                    </b-col>
                                </b-row>
                            </b-card>
                        </div>
                        <div v-else key="list-merchants">
                        <b-list-group>
                            <router-link v-for="merchant in merchants" :to="{ name: 'MerchantDetail', params: { id: merchant.id }}" :key="merchant.id">
                                <b-list-group-item>
                                    <div class="row merchant-list-row">
                                        <div class="col-4 col-xl-3">
                                            <div class="merchant-list-logo-frame">
                                                <b-img-lazy class="merchant-list-logo" :src="`/api/merchants/${merchant.id}/images/logo`"/>
                                            </div>
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
                        </transition>  
                    </div>  
                       
                </div>
                </div>
                <transition name="fade" mode="out-in">
                    <div class="row" v-if="!loading" key="footer">
                        <div class="col align-self-center" align="center">
                            <b-pagination
                                v-model="page"
                                :total-rows="pages"
                                per-page=1
                                first-number
                                last-number
                            ></b-pagination>
                        </div>
                    </div>
                </transition>
                <p v-if="error">
                    An error occurred.
                </p>
                <template v-slot:right>
                    <div class="dropdown sidebar">
                        <b-dropdown id="itemsperpage" :text="perpage + ' Results Per Page'" class="mt-3">
                            <b-dropdown-item v-on:click="perpage = 10">10</b-dropdown-item>
                            <b-dropdown-item v-on:click="perpage = 25">25</b-dropdown-item>
                            <b-dropdown-item v-on:click="perpage = 50">50</b-dropdown-item>
                        </b-dropdown>
                    </div>
                    <div class="admin-filters" v-if="$auth.isAuthenticated">
                        <b-form-checkbox size="lg" v-model="searchFilters.includeDeleted" v-on:change="getMerchants()">Include Deleted Merchants</b-form-checkbox>
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
import MyLocation from './MyLocation.vue';
import { Utils } from '../utils/util.js';
import _throttle from 'lodash/debounce';

export default {
    name: 'Merchants',
    props: {
    },
    watch: {
        "perpage": function(newVal) {
            this.getMerchants();
            localStorage.merchantsPerPage = newVal;
        },
        "page": function(newVal) {
            this.getMerchants();
            localStorage.merchantsCurrentPage = newVal;
        },
        "searchFilters.categories": function(newVal) {
            if (newVal !== this['searchFilters.categories']) {
                this.page = 1;
                this.getMerchants();
            }
        },
        "searchFilters.tags": function(newVal) {
            if (newVal !== this['searchFilters.tags']) {
                this.page = 1;
                this.getMerchants();
            }
        },
        "searchFilters.neighbourhood": function(newVal) {
            if (newVal !== this['searchFilters.neighbourhood']) {
                this.page = 1;
                this.getMerchants();
            }
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
            geoRadius: 10000,
            useGeoLocation: false,
            geoLocation: {},
            merchantLayout: 0,
            searchFilters: {
                searchquery: '',
                categories: [],
                tags: [],
                neighbourhood: '',
                includeDeleted: false
            }
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
        refreshScreen: function() {
            //this.page = 1;
            this.searchFilters.searchquery = '';
            this.getMerchants();
        },
        setGeoLocation : function(location) {
            const { enabled, position, radius } = location;
            this.useGeoLocation = enabled;
            if (enabled === true) { 
                this.geoLocation = position.coords;
                this.geoRadius = radius * 1000;
            }
            this.page = 1;
            this.getMerchants();
        },
        saveSearchFiltersToLocalStorage: function() {
            let data = {
            searchquery:    this.searchFilters.searchquery,
            categories:     this.searchFilters.categories,
            tags:           this.searchFilters.tags,
            neighbourhood:  this.searchFilters.neighbourhood
            }
            localStorage.searchFilters = data;
        },
        onResize : _throttle(function() {
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

            if (vw < 576) {
                this.merchantLayout = 1;
            }

        },250,{leading: true}),
        getMerchants: function() {
            this.loading = true;

            this.page = Utils.clamp(this.page,1,Math.max(this.pages,1));

            let params = {
                'details': true,
                'page': this.page,
                'perpage': this.perpage
            }

            if (this.searchFilters.tags && this.searchFilters.tags.length > 0) {
                params.tags = this.searchFilters.tags.join(" ");
            }

            if (this.searchFilters.categories && this.searchFilters.categories.length > 0) {
                params.categories = this.searchFilters.categories.join("+");
            }

            if (this.searchFilters.neighbourhood && this.searchFilters.neighbourhood.length > 0) {
                params.neighbourhood = this.searchFilters.neighbourhood;
            }

            if (this.searchFilters.searchquery) {
                params.search = this.searchFilters.searchquery;
            }

            if (this.searchFilters.includeDeleted) {
                params.deleted = 'true';
            }

            if (this.useGeoLocation && this.geoLocation) {
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
                if (this.pages <= 1) {
                    this.page = 1;
                } else if (this.page > this.pages) {
                    this.page = (this.pages - 1);
                }
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

        if (localStorage.merchantsPerPage) {
            this.perpage = localStorage.merchantsPerPage;
        }

        if (localStorage.merchantsCurrentPage) {
            this.page = localStorage.merchantsCurrentPage;
        }

        this.getMerchants();

        let vm = this;

        window.onpopstate = function(event) {
            if (event.state) {
                vm.selected = event.state.selected;
            }
        }
    },
    created: function() {
        window.addEventListener("resize", this.onResize);
        this.onResize();
    },
    destroyed: function() {
        window.removeEventListener("resize", this.onResize);
    }
}
</script>

<style scoped>

@media (max-width: 649.98px) { 
    .card-columns {
        column-count: 1; 
    }
}

@media (min-width: 650px) { 
    .card-columns {
        column-count: 2;
    } 
}

@media (min-width: 1150px) {
    .card-columns {
        column-count: 3;
    }
}
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
  transition: opacity 0.5s;
  max-width: 350px;
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
    margin: 1rem 1rem 1rem 1rem;
}
.merchant-list-logo {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
}
.merchant-list-logo-frame {
    position: relative;
    height: 128px;
    max-width: 128px;
}
.merchant-list-row {
    padding-top: 8px;
    padding-bottom: 8px;
}
h4.merchant-list, p.merchant-list {
    text-align: left;
}

.fade-enter-active {
  transition: opacity .5s;
}
.fade-leave-active {
  transition: opacity .25s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.pagination {
    justify-content: center;
    margin-top: 1rem;
}
</style>