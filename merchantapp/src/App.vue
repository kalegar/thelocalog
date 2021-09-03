<template>
  <v-app id="main" :style="{background: $vuetify.theme.themes[theme].background}">
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center mr-sm-2 my-1">
        <router-link :to="{ name: 'Merchants' }">
            <v-img
              alt="Localog Logo"
              :src="require('./assets/logo.svg')"
              transition="scale-transition"
              :width="logoWidth" 
            />
        </router-link>
      </div>

      <v-spacer></v-spacer>

      <v-responsive min-width="40" :max-width="searchbarWidth" min-height="20" class="mx-n2">
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

      <v-menu offset-y v-if="isDevelopment || !$auth.loading">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
            class="ml-n2 ml-sm-0"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item :to="{ name: 'profile' }" v-if="$auth.isAuthenticated">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          <v-list-item v-on:click="logout()" v-if="$auth.isAuthenticated">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Log Out</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="$auth.isAuthenticated && isAdmin" :to="{ name: 'AdminHome' }">
            <v-list-item-icon>
              <v-icon>mdi-cog</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Admin</v-list-item-title>
          </v-list-item>
          <v-list-item v-on:click="login()" v-if="!$auth.isAuthenticated">
            <v-list-item-icon>
              <v-icon>mdi-login</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Log In</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="!this.$vuetify.theme.dark" v-on:click="toggleTheme">
            <v-list-item-icon>
              <v-icon>mdi-weather-night</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Dark Mode</v-list-item-title>
          </v-list-item>
          <v-list-item v-else v-on:click="toggleTheme">
            <v-list-item-icon>
              <v-icon>mdi-weather-sunny</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Light Mode</v-list-item-title>
          </v-list-item>
        </v-list>
        
      </v-menu>

    </v-app-bar>

    <v-main>
      <v-container fluid>
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
      },
      searchbarWidth: function() {
        switch (this.$vuetify.breakpoint.name) {
          case 'xs': return 210;
          case 'sm': return 300;
          case 'md': return 450;
          default: return 550;
        }
      },
      logoWidth: function() {
        switch (this.$vuetify.breakpoint.name) {
          case 'xs': return 60;
          default: return 80;
        }
      },
      isDevelopment: function() {
        return process.env.NODE_ENV === 'development';
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
    }, 500),
    toggleTheme: function() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.darkMode = this.$vuetify.theme.dark;
    }
  },

  mounted: function() {
      this.$vuetify.theme.dark = localStorage.darkMode === 'true';
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
@media (max-width: 499.98px) { 
  .compact {
    transform: scale(0.9);
    transform-origin: left
  }
}
.v-label {
  margin-bottom: 0 !important;
}
</style>
