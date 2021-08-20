<template>
    <div class="merchants">
        <BasePage v-on:headerclicked="refreshScreen()">
            <BaseContent>
                <template v-slot:left>
                    <v-row v-if="!displayCollapseFilters" justify="center" class="ma-4">
                        <v-expansion-panels v-model="filtersPanelOpen">
                            <v-expansion-panel>
                            <v-expansion-panel-header>
                                <template v-slot:default="{ open }">
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
                                </template>
                                <template v-slot:actions>
                                    <v-icon large>mdi-chevron-down</v-icon>
                                </template>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content eager>
                                <MyLocation v-model="geo.enabled" v-bind:radius.sync="geo.radius" v-bind:location.sync="geo.location"/>
                                <MerchantTags v-model="tags"/>
                                <MerchantNeighbourhood v-model="neighbourhood"/>
                                <MerchantCategories v-model="categories"/>
                                <v-select
                                    class="my-2"
                                    :items="merchantOrderOptions"
                                    item-text="text"
                                    item-value="value"
                                    label="Order Results By"
                                    v-model="merchantOrder"
                                    color="secondary"
                                ></v-select>
                                <v-btn color="secondary" @click="filtersPanelOpen = false; getMerchants()">
                                    Search
                                </v-btn>
                            </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-row>
                </template>
                <div class="row">
                <div class="merchantlist col">
                    <v-row v-if="displayCollapseFilters" justify="center">
                        <v-expansion-panels v-model="filtersPanelOpen">
                            <v-expansion-panel>
                            <v-expansion-panel-header> 
                                <template v-slot:default="{ open }">
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
                                </template>
                                <template v-slot:actions>
                                    <v-icon large>mdi-chevron-down</v-icon>
                                </template>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content eager>
                                <MyLocation v-model="geo.enabled" v-bind:radius.sync="geo.radius" v-bind:location.sync="geo.location"/>
                                <MerchantTags v-model="tags"/>
                                <MerchantNeighbourhood v-model="neighbourhood"/>
                                <MerchantCategories v-model="categories"/>
                                <v-btn color="secondary" @click="filtersPanelOpen = false; getMerchants()">
                                    Search
                                </v-btn>
                            </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-row>
                    <v-row>
                        <v-col v-if="!searchquery">
                            <h1>Local Shops</h1>
                        </v-col>
                        <v-col v-else>
                            <h1>Results for '<em>{{searchquery}}</em>'</h1>
                        </v-col>
                        <v-col class="d-none d-sm-block" sm="2">
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
                        </v-col>
                    </v-row>
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
                                    <advertisement-card v-if="merchant.advertisement"></advertisement-card>
                                    <merchant-card v-else :key="merchant.title" :merchant="merchant" :geo="geo"></merchant-card>
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
                                <template v-for="(merchant, index) in merchants">
                                    <advertisement-list-item v-if="merchant.advertisement" :key="index"></advertisement-list-item>
                                    <merchant-list-item v-else :key="merchant.title" :merchant="merchant" :geo="geo"></merchant-list-item>
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
                    <div class="admin-filters" v-if="isAdmin">
                        <v-checkbox large v-model="includeDeleted" v-on:change="getMerchants()" label="Include Deleted Merchants"></v-checkbox>
                        <create-merchant-modal></create-merchant-modal>
                    </div>
                </template>
            </BaseContent>
        </BasePage>
  </div>
</template>

<script>
import Loading from '../components/Loading.vue'
import BasePage from './base/BasePage.page.vue';
import BaseContent from './base/BaseContent.page.vue';
import MerchantCategories from '../components/MerchantCategories.vue'
import MerchantTags from '../components/MerchantTags.vue'
import MerchantNeighbourhood from '../components/MerchantNeighbourhood.vue'
import MyLocation from '../components/MyLocation.vue';

import { Utils } from '../utils/util.js';
import _throttle from 'lodash/debounce';
import MerchantCard from '../components/MerchantCard.vue';
import MerchantListItem from '../components/MerchantListItem.vue';
import AdvertisementCard from '../components/AdvertisementCard.vue';

import { MerchantService } from '../service/Merchant.service';
import AdvertisementListItem from '../components/AdvertisementListItem.vue';
import CreateMerchantModal from '../components/CreateMerchantModal.vue';

export default {
    name: 'Merchants',
    props: {
        query: String
    },
    watch: {
        "merchantOrder": function(newVal) {
            this.getMerchants();
            localStorage.merchantOrder = newVal;
        },
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
        MyLocation,
        MerchantCard,
        MerchantListItem,
        AdvertisementCard,
        AdvertisementListItem,
        CreateMerchantModal
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
            ],
            merchantOrder: '+TITLE',
            merchantOrderOptions: [
                { text: 'Title', value: '+TITLE' },
                { text: 'Relevance', value: '+RANK' },
                { text: 'Distance', value: '+DIST' } 
            ],
            filtersPanelOpen: false
        }
    },
    computed: {
        hasSearchFilters: function() {
            return Boolean(this.categories.length || this.tags.length || this.neighbourhood.length || (this.geo && this.geo.enabled));
        },
        isAdmin: function() {
            return this.$auth.isAuthenticated && this.$auth.user[this.$auth.rolesKey] && this.$auth.user[this.$auth.rolesKey].includes('admin');
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
                includeDeleted: false,
                searchquery: this.searchquery
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

            this.loading = true;

            this.page = Utils.clamp(this.page,1,Math.max(this.pages,1));

            let options = {
                searchquery: this.searchquery,
                categories: this.categories,
                tags: this.tags,
                neighbourhood: this.neighbourhood,
                includeDeleted: this.includeDeleted,
                geo: this.geo,
                page: this.page,
                perpage: this.perpage,
                sort: this.merchantOrder
            };

            MerchantService.getMerchants(options).then(result => {
                this.loading = false;
                this.shouldGetMerchants = false;
                this.merchants = result.merchants;
                this.page = result.page;
                this.pages = result.pages;
            }, err => {
                this.loading = false;
                this.shouldGetMerchants = false;
                if (!err.cancelled) {
                    console.log(err);
                }
            });
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

        if (localStorage.merchantOrder) {
            this.merchantOrder = localStorage.merchantOrder;
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
h1{
  text-align: left;
  margin-bottom: 1rem;
}
.merchantlist {
    margin-top: 2rem;
    margin-left: 2rem;
    margin-right: 2rem;
    width: 100%;
}
.sidebar {
    margin: 1rem 1rem 1rem 1rem;
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