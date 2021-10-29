<template>
    <div class="merchants">
        <BasePage>
            <BaseContent>
                <template v-slot:left>
                    <v-row justify="center" class="my-4 mx-0">
                        <v-expansion-panels v-model="filtersPanelOpen">
                            <v-expansion-panel>
                            <v-expansion-panel-header>
                                <template v-slot:default="{ open }">
                                <v-row no-gutters class="mx-0">
                                <v-icon :color="hasSearchFilters ? 'secondary' : ''" :large="!open" :x-large="open" class="mr-1 ml-n1">mdi-filter-variant</v-icon>
                                <v-col class="mt-1 text-xs-body text-sm-h6" align-self="center">
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
                                    v-model="franchise"
                                    label="Franchise"
                                    :items="franchiseOptions"
                                    clearable
                                    color="secondary"
                                ></v-select>
                                <!-- <v-select
                                    v-model="canadianOwned"
                                    label="Canadian Owned"
                                    :items="canadianOwnedOptions"
                                    clearable
                                    color="secondary"
                                ></v-select> -->
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
                <v-row>
                <v-col class="merchantlist col mx-0 mx-sm-4 mt-2">
                    <v-row class="mb-1">
                        <v-col>
                            <v-row no-gutters align-content="center">
                                <h1 v-if="!searchquery" class="mb-n1">Local Shops</h1>
                                <h1 v-else>Results for '<em>{{searchquery}}</em>'</h1>
                                <create-merchant-modal fab text="" button-class="ml-3 my-auto" small v-if="isAdmin"></create-merchant-modal>
                            </v-row>
                        </v-col>
                        <v-col class="d-none d-sm-block">
                            <v-row no-gutters>
                                <v-spacer></v-spacer>
                                <h3 class="mr-2 my-auto">Results Display Mode:</h3>
                                <v-btn-toggle
                                    v-model="selectedMerchantLayout"
                                    mandatory
                                    borderless
                                    class="elevation-2"
                                    color="primary"
                                >
                                    <v-tooltip top>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn v-on="on" v-bind="attrs">
                                                <v-icon>mdi-format-list-bulleted-square</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>List Results</span>
                                    </v-tooltip>
                                    <v-tooltip top>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn v-on="on" v-bind="attrs">
                                                <v-icon>mdi-view-grid-outline</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>Tile Results</span>
                                    </v-tooltip>
                                </v-btn-toggle>
                            </v-row>
                        </v-col>
                    </v-row>
                    <h3 v-if="!loading && merchants && !merchants.length">No Merchants Found!</h3>
                    <div v-if="merchantLayout == 1">
                        <v-fade-transition name="fade" mode="out-in">
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
                        </v-fade-transition>
                    </div>
                    <div v-if="merchantLayout == 0">
                        <v-fade-transition name="fade" mode="out-in">
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
                        </v-fade-transition>  
                    </div>  
                </v-col>
                </v-row>
                <v-fade-transition name="fade" mode="out-in">
                    <div class="row" v-if="!loading" key="footer">
                        <div class="col align-self-center" align="center">
                            <v-pagination
                                v-model="page"
                                :length="pages"
                                :total-visible="paginationNumVisible"
                                circle
                            ></v-pagination>
                        </div>
                    </div>
                </v-fade-transition>
                <p v-if="error">
                    An error occurred. {{error}}
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
                            color="secondary"
                            item-color="secondary"
                        ></v-select>
                    </div>
                    <div class="admin-filters" v-if="isAdmin">
                        <v-checkbox large v-model="includeDeleted" v-on:change="getMerchants()" label="Include Deleted Merchants"></v-checkbox>
                    </div>
                </template>
            </BaseContent>
        </BasePage>
  </div>
</template>

<script>
import BasePage from './base/BasePage.page.vue';
import BaseContent from './base/BaseContent.page.vue';
import MerchantCategories from '../components/MerchantCategories.vue'
import MerchantTags from '../components/MerchantTags.vue'
import MerchantNeighbourhood from '../components/MerchantNeighbourhood.vue'
import MyLocation from '../components/MyLocation.vue';

import { Utils } from '../utils/util.js';
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
            sessionStorage.merchantOrder = newVal;
        },
        "perpage": function(newVal) {
            this.getMerchants();
            localStorage.merchantsPerPage = newVal;
        },
        "page": function(newVal) {
            this.getMerchants();
            sessionStorage.merchantsCurrentPage = newVal;
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
        "franchise": function() {
            this.shouldGetMerchants = true;
            sessionStorage.franchise = this.franchise;
        },
        "canadianOwned": function() {
            this.shouldGetMerchants = true;
            sessionStorage.canadianOwned = this.canadianOwned;
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
            selectedMerchantLayout: 0,
            shouldGetMerchants: false,
            //SEARCH FILTERS:
                searchquery: '',
                categories: [],
                tags: [],
                neighbourhood: [],
                includeDeleted: false,
                franchise: '',
                canadianOwned: '',
                independent: false,
            franchiseOptions: [
                { text: 'Independent', value: 'false' },
                { text: 'Franchise', value: 'true' }
            ],
            canadianOwnedOptions: [
                { text: 'Canadian Owned', value: 'true' },
                { text: 'Non-Canadian Owned', value: 'false' }
            ],
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
        },
        paginationNumVisible: function() {
            switch (this.$vuetify.breakpoint.name) {
                case 'xs': return 7;
                case 'sm': return 8;
                case 'md': return 10;
                default: return 12;
            }
        },
        merchantLayout: function() {
            return this.$vuetify.breakpoint.xs ? 1 : this.selectedMerchantLayout;
        },
        merchantCardCols: function() {
            if (this.$vuetify.breakpoint.width < 700) {
                return 12;
            }else if (this.$vuetify.breakpoint.width < 1264) {
                return 6;
            }else if (this.$vuetify.breakpoint.width < 2300) {
                return 4;
            }else {
                return 3;
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
        getMerchants: function(filters = null) {

            this.loading = true;

            if (filters) {
                this.page = 1;
                for (const key in filters) {
                    this[key] = filters[key];
                }
            }
            let options = {
                searchquery: this.searchquery,
                categories: this.categories,
                tags: this.tags,
                neighbourhood: this.neighbourhood,
                includeDeleted: this.includeDeleted,
                geo: this.geo,
                page: this.page,
                perpage: this.perpage,
                sort: this.merchantOrder,
                canadianOwned: this.canadianOwned
            };
            if (this.franchise !== null) {
                if (this.franchise === 'true') {
                    options.franchise = 'true';
                }else if (this.franchise == 'false'){
                    options.independent = 'true';
                }
            }

            MerchantService.getMerchants(options).then(result => {
                this.shouldGetMerchants = false;
                this.merchants = result.merchants;
                this.pages = result.pages;
                this.page = Utils.clamp(result.page,1,Math.max(this.pages,1));
                this.loading = false;
            }, err => {
                this.shouldGetMerchants = false;
                if (!err.cancelled) {
                    this.loading = false;
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

        if (localStorage.merchantsPerPage) {
            this.perpage = Number(localStorage.merchantsPerPage);
        }

        if (localStorage.merchantLayout) {
            this.selectedMerchantLayout = Number(localStorage.merchantLayout);
        }

        if (sessionStorage.merchantsCurrentPage) {
            this.page =  Number(sessionStorage.merchantsCurrentPage);
        }

        if (sessionStorage.merchantOrder) {
            this.merchantOrder = sessionStorage.merchantOrder;
        }

        if (sessionStorage.franchise) {
            if (sessionStorage.franchise === 'null') {
                this.franchise = null;
            }else{
                this.franchise = sessionStorage.franchise;
            }
        }

        if (sessionStorage.canadianOwned) {
            if (sessionStorage.canadianOwned === 'null') {
                this.canadianOwned = null;
            }else{
                this.canadianOwned = sessionStorage.canadianOwned;
            }
        }

        this.getMerchants();

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
h1{
  text-align: left;
  margin-bottom: 1rem;
}
.merchantlist {
    width: 100%;
}
.sidebar {
    margin: 1rem 1rem 1rem 1rem;
}
/* .fade-enter-active {
  transition: opacity .5s;
}
.fade-leave-active {
  transition: opacity .25s;
}
.fade-enter, .fade-leave-to  {
  opacity: 0;
} */
</style>