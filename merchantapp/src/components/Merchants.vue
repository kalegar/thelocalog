<template>
    <div class="merchants">
        <BasePage v-on:headerclicked="refreshScreen()">
            <template v-slot:header>
                <SearchBar v-on:search="searchquery = $event; getMerchants()"/>
            </template>
            <BaseContent>
                <template v-slot:left>
                    <div class="sidebar">
                        <MerchantTags v-on:tags="tags = $event; getMerchants()"/>
                        <MerchantCategories v-on:categories="categories = $event; getMerchants()"/>
                        <MerchantNeighbourhood v-on:neighbourhood="neighbourhood = $event; getMerchants()"/>
                    </div>
                </template>
                <div class="row">
                <div class="merchantlist col" v-if="!$route.params.id">
                    <div v-if="!searchquery" class="row">
                        <div class="col">
                        <h1>Local Shops</h1>
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
                    <!--<b-list-group class="list-group" v-if="!loading && merchants && merchants.length">-->
                        <transition-group name="list" tag="b-list-group" class="merchantitems shadow">
                            <b-list-group-item class="list-group-item list-item" :to="{ name: 'MerchantDetail', params: { id: merchant.id }}" v-for="merchant in merchants" :key="merchant.id">
                                <h2><router-link :to="{ name: 'MerchantDetail', params: { id: merchant.id }}">{{ merchant.title }}</router-link></h2>
                                <p>{{ merchant.description }}</p>
                                <a v-if="merchant.website" :href="merchant.website">{{merchant.website}}</a>
                            </b-list-group-item>
                        </transition-group>
                    <!--</b-list-group>-->
                    
                    
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
        MerchantNeighbourhood
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
            neighbourhood: ''
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

            axios.get('/api/merchants', {
                params
            })
            .then(res => {
                if (res.status != 200) {
                    console.log('ERROR');
                    const error = new Error(res.statusText);
                    throw error;
                }
                const tempMerchants = res.data.merchants.rows;
                for (let i = this.merchants.length-1; i >= 0; i--) {
                    if (tempMerchants.filter(e => e.id === this.merchants[i].id).length == 0) {
                        this.merchants.splice(i,1);
                    }
                }
                tempMerchants.map(e => {
                    if (this.merchants.filter(m => m.id === e.id).length == 0) {
                        this.merchants.push(e);
                    }
                })


                //this.merchants = res.data.merchants.rows;
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
  text-align: left;
}
.list-enter-active, .list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateX(30px);
}
.sidebar {
    margin: 1rem 3rem 1rem 3rem;
}
</style>