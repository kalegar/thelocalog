<template>
  <v-app id="main" :style="{background: $vuetify.theme.themes[theme].background}">
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <router-link :to="{ name: 'Merchants' }">
        <v-img
          alt="Localog Logo"
          class="shrink mr-2"
          contain
          :src="require('./assets/logo.svg')"
          transition="scale-transition"
          width="80"
        />
        </router-link>
      </div>

      <v-spacer></v-spacer>

      <v-responsive min-width="40" max-width="450" content-class="compact">
        <v-text-field
          dense
          flat
          hide-details
          rounded
          solo-inverted
          clearable
          v-bind:append-icon="(searchQuery && searchQuery.length > 0) ? '' : 'mdi-magnify'"
          v-model="searchQuery"
          @click:append="search()"
        >
        </v-text-field>
      </v-responsive>

      <v-spacer></v-spacer>

      <v-menu offset-y v-if="!$auth.loading">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list v-if="$auth.isAuthenticated">
          <v-list-item :to="{ name: 'profile' }">
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          <v-list-item v-on:click="logout()">
            <v-list-item-title>Log Out</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isAdmin" :to="{ name: 'AdminHome' }">
            <v-list-item-title>Admin</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-list v-else>
          <v-list-item v-on:click="login()">
            <v-list-item-title>Log In</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

    </v-app-bar>

    <v-main>
      <v-container>
      <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import _debounce from 'lodash/debounce';
import { UserService } from './service/User.service.js';

export default {
  name: 'App',

  components: {
  },

  data: function() {
    return {
    searchQuery: ''
  }},

  watch: {
    "searchQuery": function() {
      this.search();
    }
  },

  computed: {
      isAdmin: function() {
        return this.$auth.user[this.$auth.rolesKey] && this.$auth.user[this.$auth.rolesKey].includes('admin');
      },
      theme(){
        return (this.$vuetify.theme.dark) ? 'dark' : 'light'
      }
  },

  methods: {
    login: function() {
        this.$auth.loginWithRedirect();
    },
    logout: function() {
        this.$auth.logout({
          returnTo: window.location.origin
        });
    },
    search: _debounce(function() {
      this.$router.push({ name: 'Merchants', query: { q: this.searchQuery }});
    }, 500)
  },

  mounted: function() {
      this.$auth.$watch('loading', (isLoading) => {
        if (isLoading === false) {
          this.$auth.getTokenSilently().then((authToken) => {
           UserService.initUser(authToken);
        }, err => {
          console.log(err);
        });
        }
      })  
        
  }
};
</script>

<style>
@media (max-width: 649.98px) { 
  .compact {
    transform: scale(0.875);
    transform-origin: left
  }
}
.v-label {
  margin-bottom: 0 !important;
}
</style>
