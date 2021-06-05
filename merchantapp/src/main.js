import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

import './app.scss'

import { domain, clientId, audience } from "../auth_config.json";

import { Auth0Plugin, authGuard } from "./auth";

Vue.use(VueRouter);
// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);

import Merchants from './components/Merchants.vue';
import MerchantDetail from './components/MerchantDetail.vue';
import Profile from './components/Profile.vue';
import MerchantClaim from './components/MerchantClaim.vue';
import AdminHome from './components/AdminHome.vue';
import vuetify from './plugins/vuetify'

const routes = [
  { path: '/', redirect: '/merchants' },
  { path: '/merchants', component: Merchants, name: 'Merchants', props: route => ({ query: route.query.q }) },
  { path: '/merchants/:id', component: MerchantDetail, name: 'MerchantDetail', props: true },
  { path: '/profile', name: "profile", component: Profile, beforeEnter: authGuard},
  { path: '/claim/:id', component: MerchantClaim, name: 'MerchantClaim', beforeEnter: authGuard, props: true},
  { path: '/admin', component: AdminHome, name: 'AdminHome', beforeEnter: authGuard}
]

const router = new VueRouter({
  routes
});

// Use Auth0Plugin
Vue.use(Auth0Plugin, {
  domain,
  clientId,
  audience,
  onRedirectCallback: appState => {
    router.push(
      appState && appState.targetUrl ? appState.targetUrl : window.location.pathname
    );
  }
});

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  vuetify,
  router
}).$mount('#app')

// new Vue({
//   render: h => h(App),
// }).$mount('#app')
