import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

import { domain, clientId, audience } from "../auth_config.json";
import { socketioDomain } from "../socketio_config.json";

import { Auth0Plugin, authGuard } from "./auth";
import VueSocketIOExt from 'vue-socket.io-extended';
import { io } from 'socket.io-client';

Vue.use(VueRouter);

import Merchants from './pages/Merchants.page.vue';
import MerchantDetail from './pages/MerchantDetail.page.vue';
import Profile from './pages/Profile.page.vue';
import MerchantClaim from './pages/MerchantClaim.page.vue';
import MerchantClaimDetail from './pages/MerchantClaimDetail.page.vue';
import AdminHome from './pages/AdminHome.page.vue';
import vuetify from './plugins/vuetify';

const routes = [
  { path: '/', redirect: '/merchants' },
  { path: '/merchants', component: Merchants, name: 'Merchants', props: route => ({ query: route.query.q }) },
  { path: '/merchants/:id', component: MerchantDetail, name: 'MerchantDetail', props: true },
  { path: '/profile', name: "profile", component: Profile, beforeEnter: authGuard},
  { path: '/claim/:id', component: MerchantClaim, name: 'MerchantClaim', beforeEnter: authGuard, props: true},
  { path: '/admin', component: AdminHome, name: 'AdminHome', beforeEnter: authGuard},
  { path: '/admin/claim/:id', component: MerchantClaimDetail, name: 'ClaimDetail', beforeEnter: authGuard, props: true}
]

const router = new VueRouter({
  routes
});

const iodomain = process.env.NODE_ENV !== 'development' ? socketioDomain : 'http://localhost:3000';
const socket = io(iodomain);

Vue.use(VueSocketIOExt, socket);

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
