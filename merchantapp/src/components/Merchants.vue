<template>
    <div class="merchants">
        <BasePage v-on:headerclicked="refreshScreen()">
            <BaseContent>
                <template v-slot:left>
                    <v-row v-if="!displayCollapseFilters" justify="center" class="ma-4">
                        <v-expansion-panels>
                            <v-expansion-panel>
                            <v-expansion-panel-header v-slot:default="{ open }">
                                <v-row no-gutters>
                                <v-icon :color="hasSearchFilters ? 'secondary' : ''" :large="open">mdi-filter</v-icon>
                                <v-col class="mt-1" align-self="center">
                                Search Filters
                                </v-col>
                                <v-col class="mt-1 mr-2" align-self="center" v-if="hasSearchFilters">
                                    <v-spacer></v-spacer>
                                    <v-btn color="secondary" class="ma-0 float-right" small @click.native.stop="clearFilters()">Reset</v-btn>
                                </v-col>
                                </v-row>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content eager>
                                <MyLocation v-model="geo.enabled" v-bind:radius.sync="geo.radius" v-bind:location.sync="geo.location"/>
                                <MerchantTags v-model="tags"/>
                                <MerchantNeighbourhood v-model="neighbourhood"/>
                                <MerchantCategories v-model="categories"/>
                            </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-row>
                </template>
                <div class="row">
                <div class="merchantlist col">
                    <v-row v-if="displayCollapseFilters" justify="center">
                        <v-expansion-panels>
                            <v-expansion-panel>
                            <v-expansion-panel-header v-slot:default="{ open }">
                                <v-row no-gutters>
                                <v-icon :color="hasSearchFilters ? 'secondary' : ''" :large="open">mdi-filter</v-icon>
                                <v-col class="mt-1" align-self="center">
                                Search Filters
                                </v-col>
                                <v-col class="mt-1 mr-2" align-self="center" v-if="hasSearchFilters">
                                    <v-spacer></v-spacer>
                                    <v-btn color="secondary" class="ma-0 float-right" small @click.native.stop="clearFilters()">Reset</v-btn>
                                </v-col>
                                </v-row>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content eager>
                                <MyLocation v-model="geo.enabled" v-bind:radius.sync="geo.radius" v-bind:location.sync="geo.location"/>
                                <MerchantTags v-model="tags"/>
                                <MerchantNeighbourhood v-model="neighbourhood"/>
                                <MerchantCategories v-model="categories"/>
                            </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-row>
                    <div class="row">
                        <div v-if="!searchquery" class="col">
                            <h1>Local Shops</h1>
                        </div>
                        <div v-else class="col">
                            <h1>Results for '<em>{{searchquery}}</em>'</h1>
                        </div>
                        <div class="d-none d-sm-block col-sm-2">
                            <v-btn-toggle
                                v-model="merchantLayout"
                                mandatory
                                color="primary"
                            >
                                <v-btn>
                                    <v-icon>mdi-format-list-bulleted-square</v-icon>
                                </v-btn>
                                <v-btn>
                                    <v-icon>mdi-view-grid-outline</v-icon>
                                </v-btn>
                            </v-btn-toggle>
                        </div>
                    </div>
                    <Loading :loading="loading && 1==2"/>
                    <h3 v-if="!loading && merchants && !merchants.length">No Merchants Found!</h3>
                    <div v-if="merchantLayout == 1">
                        <transition name="fade" mode="out-in">
                        <div v-if="loading" key="skeleton">
                            <v-row>
                                <v-col v-for="n in parseInt(perpage)" v-bind:key="n" :cols="merchantCardCols">
                                    <v-skeleton-loader
                                      class="mx-auto"
                                      max-width="400"
                                      type="card"
                                      shaped
                                    ></v-skeleton-loader>
                                </v-col>
                            </v-row>
                        </div>
                        <div v-else key="merchants">
                            <v-row>
                                <v-col v-for="merchant in merchants" :key="merchant.id" class="mcard-columns" :cols="merchantCardCols">
                                    <v-hover v-slot:default="{ hover }">
                                    <v-card
                                        max-width="400"
                                        outlined
                                        dense
                                        shaped
                                        :elevation="hover ? 12 : 4"
                                        :to="{ name: 'MerchantDetail', params: { id: merchant.id, geoLocation: geo.location }}"
                                    >
                                        <v-list-item three-line class="mb-n2">
                                            <v-list-item-content>
                                                <h3>{{merchant.title}}</h3>
                                            </v-list-item-content>

                                            <v-list-item-avatar
                                              tile
                                              size="100"
                                            ><v-img contain :src="`/api/merchants/${merchant.id}/images/logo`"/></v-list-item-avatar>

                                        </v-list-item>

                                        <v-divider class="mx-4"></v-divider>

                                        <v-list-item three-line class="my-n3">
                                        <v-list-item-subtitle v-if="merchant.description">{{merchant.description}}</v-list-item-subtitle>
                                        <v-list-item-subtitle v-else>A local shop near you!</v-list-item-subtitle>
                                        </v-list-item>

                                        <v-divider class="mx-4"></v-divider>


                                        <div class="d-flex" style="height: 24px;"> 
                                            <v-spacer></v-spacer>
                                            <v-list-item class="my-n1" style="width: 50%; max-width: 50%;">
                                            <v-list-item-subtitle v-if="merchant.distance"><v-icon>mdi-map-marker-outline</v-icon> Distance: {{merchant.distance >= 1000 ? (merchant.distance / 1000).toFixed(1) + 'km' : merchant.distance.toFixed(0) + 'm'}}</v-list-item-subtitle>
                                            </v-list-item>
                                        </div>
                                        <v-card-actions>
                                        </v-card-actions>
                                    </v-card>
                                    </v-hover>
                                </v-col>
                            </v-row>
                        </div>
                        </transition>
                    </div>
                    <div v-if="merchantLayout == 0">
                        <transition name="fade" mode="out-in">
                        <div v-if="loading" key="list-skeleton">
                            <v-skeleton-loader
                                v-for="n in parseInt(perpage)" v-bind:key="n"
                                class="mx-auto"
                                type="list-item-three-line"
                                shaped
                            ></v-skeleton-loader>
                        </div>
                        <div v-else key="list-merchants">
                            <v-list three-line>
                                <template v-for="merchant in merchants">
                                    <v-hover v-slot:default="{ hover }" :key="merchant.title">
                                        <v-list-item :to="{ name: 'MerchantDetail', params: { id: merchant.id, geoLocation: geo.location }}">
                                            <div v-if="!merchant.distance">
                                            <v-list-item-avatar class="mt-n4">
                                                <v-icon :large="hover" >mdi-storefront</v-icon>
                                            </v-list-item-avatar>
                                            </div>
                                            <div class="mt-n2" v-if="merchant.distance">
                                                <v-list-item-avatar class="my-0">
                                                    <v-icon :large="hover">mdi-map-marker-outline</v-icon>
                                                </v-list-item-avatar>
                                                <v-list-item-subtitle class="mr-4 mt-n1">{{merchant.distance >= 1000 ? (merchant.distance / 1000).toFixed(1) + 'km' : merchant.distance.toFixed(0) + 'm'}}</v-list-item-subtitle>
                                            </div>

                                            <v-divider vertical class="my-4 mr-2"></v-divider>

                                            <v-list-item-content class="merchant-list-item">
                                                <h3>{{merchant.title}}</h3>
                                                <v-list-item-subtitle v-if="merchant.description">{{merchant.description}}</v-list-item-subtitle>
                                                <v-list-item-subtitle v-else>A local shop near you!</v-list-item-subtitle>
                                            </v-list-item-content>

                                            <v-list-item-avatar
                                              tile
                                              size="80"
                                            ><v-img contain :src="`/api/merchants/${merchant.id}/images/logo`"/></v-list-item-avatar>
                                        </v-list-item>
                                    </v-hover>
                                    <v-divider
                                      :key="merchant.id"
                                      class="mx-4"
                                    ></v-divider>
                                </template>
                            </v-list>
                        </div>
                        </transition>  
                    </div>  
                </div>
                </div>
                <transition name="fade" mode="out-in">
                    <div class="row" v-if="!loading" key="footer">
                        <div class="col align-self-center" align="center">
                            <v-pagination
                                v-model="page"
                                :length="pages"
                                total-visible="7"
                                circle
                            ></v-pagination>
                        </div>
                    </div>
                </transition>
                <p v-if="error">
                    An error occurred.
                </p>
                <template v-slot:right>
                    <div class="dropdown sidebar">
                        <v-select
                            class="my-2"
                            :items="perPageOptions"
                            item-text="text"
                            item-value="value"
                            label="Results Per Page"
                            solo
                            v-model="perpage"
                        ></v-select>
                    </div>
                    <div class="admin-filters" v-if="$auth.isAuthenticated">
                        <v-checkbox large v-model="includeDeleted" v-on:change="getMerchants()" label="Include Deleted Merchants"></v-checkbox>
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
import MerchantCategories from './MerchantCategories.vue'
import MerchantTags from './MerchantTags.vue'
import MerchantNeighbourhood from './MerchantNeighbourhood.vue'
import MyLocation from './MyLocation.vue';
import { Utils } from '../utils/util.js';
import _throttle from 'lodash/debounce';

let cancelToken;

export default {
    name: 'Merchants',
    props: {
        query: String
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
        "query": function() {
            this.getMerchants({ searchquery: this.query });
        },
        "merchantLayout": function() {
            localStorage.merchantLayout = String(this.merchantLayout);
        },
        "tags": function() {
            this.shouldGetMerchants = true;
        },
        "neighbourhood": function() {
            this.shouldGetMerchants = true;
        },
        "categories": function() {
            this.shouldGetMerchants = true;
        },
        "geo.enabled": function() {
            this.shouldGetMerchants = true;
        },
        "geo.radius": function() {
            if (this.geo.enabled) {
                this.shouldGetMerchants = true;
            }
        },
        "shouldGetMerchants": function(newValue, oldValue) {
            console.log('should get: ' + this.shouldGetMerchants);
            if (newValue && (oldValue !== newValue)) {
                this.getMerchants();
            }
        }
    },
    components: {
        BasePage,
        BaseContent,
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
            perpage: '10',
            geo: {
                enabled: false,
                location: {},
                radius: 10
            },
            merchantLayout: 0,
            merchantCardCols: 4,
            shouldGetMerchants: false,
            //SEARCH FILTERS:
                searchquery: '',
                categories: [],
                tags: [],
                neighbourhood: [],
                includeDeleted: false,

            displayCollapseFilters: false,
            perPageOptions: [
                { text: '10 Per Page', value: '10' },
                { text: '25 Per Page', value: '25' },
                { text: '50 Per Page', value: '50' }
            ]
        }
    },
    computed: {
        hasSearchFilters: function() {
            return Boolean(this.categories.length || this.tags.length || this.neighbourhood.length || (this.geo && this.geo.enabled));
        }
    },
    methods: {
        merchantClick: function(id) {
            this.$router.push({ path: `/merchants/${id}`});
        },
        backClick: function() {
            history.back();
        },
        refreshScreen: function() {
            this.searchquery = '';
            this.getMerchants();
        },
        clearFilters: function() {
            this.getMerchants({
                geo: {
                    enabled: false,
                    location: {},
                    radius: 10
                },
                categories: [],
                tags: [],
                neighbourhood: [],
                includeDeleted: false
            });
        },
        onResize : _throttle(function() {
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

            if (vw < 600) {
                this.merchantLayout = 1;
                this.merchantCardCols = 12;
                this.displayCollapseFilters = true;
            }else if (vw < 1264) {
                this.merchantCardCols = 6;
                this.displayCollapseFilters = false;
            }else{
                this.merchantCardCols = 4;
                this.displayCollapseFilters = false;
            }

        },250,{leading: true}),
        getMerchants: function(filters = null) {

            if (filters) {
                this.page = 1;
                for (const key in filters) {
                    this[key] = filters[key];
                }
            }

            if (typeof cancelToken != typeof undefined) {
                cancelToken.cancel("Operation canceled due to new request.");
            }
            this.loading = true;

            this.page = Utils.clamp(this.page,1,Math.max(this.pages,1));

            let params = {
                'details': true,
                'page': this.page,
                'perpage': this.perpage
            }

            if (this.tags && this.tags.length > 0) {
                params.t = this.tags.join(",");
            }

            if (this.categories && this.categories.length > 0) {
                params.c = this.categories.join(",");
            }

            if (this.neighbourhood && this.neighbourhood.length > 0) {
                params.n = this.neighbourhood.join(",");
            }

            if (this.searchquery) {
                params.s = this.searchquery;
            }

            if (this.includeDeleted) {
                params.deleted = 'true';
            }

            if (this.geo && this.geo.enabled && this.geo.location) {
                console.log(this.geo);
                params.lat = this.geo.location.latitude;
                params.lon = this.geo.location.longitude;
                if (this.geo.radius) {
                    params.radius = this.geo.radius * 1000;
                }
            }

            cancelToken = axios.CancelToken.source();
            axios.get('/api/merchants', {
                params,
                cancelToken: cancelToken.token
            })
            .then(res => {
                if (res.status != 200) {
                    console.log('ERROR');
                    const error = new Error(res.statusText);
                    throw error;
                }
                this.merchants = res.data.merchants.rows;
                this.pages = Math.ceil(res.data.merchants.count / this.perpage);
                if (this.pages <= 1) {
                    this.page = 1;
                } else if (this.page > this.pages) {
                    this.page = (this.pages - 1);
                }
            })
            .catch(err => {
                if (axios.isCancel(err)) {
                    return;
                }
                this.error = err;
                if (err.json) {
                    return err.json.then(json => {
                        this.error.message = json.message;
                    });
                }
            })
            .then(() => {
                this.loading = false;
                this.shouldGetMerchants = false;
            })
        }
    },
    updated: function() {
        document.title = 'Directory - The Localog';
    },
    mounted: function() {

        if (this.query) {
            this.searchquery = this.query;
        }

        let retrieve = true;
        if (localStorage.merchantsPerPage) {
            this.perpage = localStorage.merchantsPerPage;
            retrieve = false;
        }

        if (localStorage.merchantsCurrentPage) {
            this.page = localStorage.merchantsCurrentPage;
            retrieve = false;
        }

        if (localStorage.merchantLayout) {
            this.merchantLayout = Number(localStorage.merchantLayout);
        }

        if (retrieve)
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
h1{
  text-align: left;
  margin-bottom: 1rem;
}
.merchant-list-item{
    text-align: left;
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
</style>