<template>
  <v-app id="main" :style="{background: $vuetify.theme.themes[theme].background}">
    <v-app-bar
      app
      color="primary"
      dark
      :height="headerHeight"
    >
      <div class="d-flex align-center mr-sm-2 my-1">
        <router-link :to="{ name: 'Merchants' }" v-on:click.native="searchQuery = '';">
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
          @input="search"
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

    <v-footer
      color="primary"
    >
      <v-card
        flat
        tile
        width="100%"
        color="primary"
        class="white--text text-center"
      >
        <v-card-text>
          <v-btn
            v-for="link in footerLinks"
            :key="link.label"
            :text="link.label.length > 0"
            :icon="link.icon.length > 0"
            :to="link.to"
            :href="link.href"
            :target="link.target"
            v-on="link.onClick !== null ? { click: link.onClick } : {}"
            color="white"
            rounded
            class="m-2"
          ><v-icon v-if="link.icon.length > 9" size="24px">
              mdi-instagram
            </v-icon>{{link.label}}</v-btn>
        </v-card-text>

        <v-card-text class="white--text pt-0">
            The Localog. Find Local, Shop Local. Search local shops and products near you! Currently servicing Edmonton, Alberta. © {{ new Date().getFullYear() }} — <strong>The Localog</strong>
        </v-card-text>
      </v-card>
      <v-dialog
        v-model="contactUsDialog"
        max-width="600px"
        persistent
      >
        <v-card>
          <v-form
              ref="contactUsForm"
              v-model="contactUsValid"
              v-on:submit.prevent="sendContactUsEmail"
            >
          <v-card-title>
            <span class="text-h5">Contact Us</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Name"
                    :rules="nameRules"
                    name="name"
                    required
                    solo
                    v-model="contactUsForm.name"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="E-Mail Address"
                    :rules="emailRules"
                    name="email"
                    required
                    solo
                    v-model="contactUsForm.email"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    label="Message"
                    name="message"
                    required
                    solo
                    v-model="contactUsForm.message"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-container>
            
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="danger"
              text
              :loading="sendingEmail"
              @click="toggleContactUsDialog"
            >Cancel</v-btn>
            <v-btn
              color="primary"
              text
              type="submit"
              :loading="sendingEmail"
            >Send</v-btn>
          </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>
    </v-footer>
  </v-app>
</template>

<script>
import _debounce from 'lodash/debounce';
import { UserService } from './service/User.service.js';
import emailjs from 'emailjs-com';

export default {
  name: 'App',

  components: {
  },

  data: function() {
    return {
      searchQuery: '',
      contactUsDialog: false,
      contactUsValid: true,
      contactUsForm: {
        name: '',
        email: '',
        message: ''
      },
      sendingEmail: false,
      nameRules: [
                v => !!v || 'Name is required'
            ],
      emailRules: [
                v => !!v || 'E-mail is required',
                v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
            ],
      footerLinks: [
        { label: 'About Us', icon: '', to: { name: 'AboutUs' }, href: undefined, onClick: null },
        { label: 'Contact Us', icon: '', to: undefined, href: undefined, onClick: this.toggleContactUsDialog },
        { label: '', icon: 'mdi-instagram', to: undefined, href: "https://www.instagram.com/the_localog/", target: "_blank", onClick: null }
      ]
  }},

  watch: {
    $route: function(to) {
      if ('q' in to.query) {
        this.searchQuery = to.query.q;
      }
    }
  },

  computed: {
      isAdmin: function() {
        return this.$auth.isAuthenticated && this.$auth.user[this.$auth.rolesKey] && this.$auth.user[this.$auth.rolesKey].includes('admin');
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
        return this.$vuetify.breakpoint.mobile ? '70' : '100'
      },
      headerHeight: function() {
        return this.$vuetify.breakpoint.mobile ? '60' : '80'
      },
      isDevelopment: function() {
        return process.env.NODE_ENV === 'development';
      }
  },

  methods: {
    clearContactUs: function() {
      this.contactUsForm.name = '';
      this.contactUsForm.email = '';
      this.contactUsForm.message = '';
    },
    toggleContactUsDialog: function() {
      this.contactUsDialog = !this.contactUsDialog;
      if (!this.contactUsDialog) {
        this.clearContactUs();
      }
    },
    sendContactUsEmail: function(e) {
      this.$refs.contactUsForm.validate();
      if (this.contactUsValid) {
        let v = this;
        this.sendingEmail = true;
        emailjs.sendForm('service_j7sziak','template_xscxjzs',e.target,"user_HxiP3Hs1N092Qcq4eKye7").then(function(response) {
            console.log(response.status);
            v.sendingEmail = false;
            v.contactUsDialog = false;
            this.clearContactUs();
        }, function(error) {
            console.log('FAILED...', error);
            v.sendingEmail = false;
            v.contactUsDialog = false;
            this.clearContactUs();
        });
      }
    },
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
        }, () => {
          // Do Nothing
        });
        }
      });
      this.$nextTick(function() {
        if ('q' in this.$route.query) {
          this.searchQuery = this.$route.query.q;
        }
      });
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
