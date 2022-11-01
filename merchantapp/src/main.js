import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

import authConfig from "../auth_config.json";
import { socketioDomain } from "../socketio_config.json";

import { Auth0Plugin, authGuard } from "./auth";
import VueSocketIOExt from 'vue-socket.io-extended';
import { io } from 'socket.io-client';

Vue.use(VueRouter);

import MerchantsPage from './pages/Merchants.page.vue';
import MerchantDetail from './pages/MerchantDetail.page.vue';
import ProfilePage from './pages/Profile.page.vue';
import MerchantClaim from './pages/MerchantClaim.page.vue';
import MerchantClaimDetail from './pages/MerchantClaimDetail.page.vue';
import AdminHome from './pages/AdminHome.page.vue';
import ProductEdit from './pages/ProductEdit.page.vue';
import AboutUs from './pages/AboutUs.page.vue';
import vuetify from './plugins/vuetify';

const routes = [
  { path: '/', redirect: '/merchants' },
  { path: '/merchants', component: MerchantsPage, name: 'Merchants', props: route => ({ query: route.query.q }) },
  { path: '/merchants/:merchantId/product/', component: ProductEdit, name: 'ProductNew', beforeEnter: authGuard, props: true },
  { path: '/merchants/:merchantId/product/:productId', component: ProductEdit, name: 'ProductEdit', beforeEnter: authGuard, props: true },
  { path: '/merchants/:merchantId', component: MerchantDetail, name: 'MerchantDetail', props: true },
  { path: '/profile', name: "profile", component: ProfilePage, beforeEnter: authGuard},
  { path: '/claim/:id', component: MerchantClaim, name: 'MerchantClaim', beforeEnter: authGuard, props: true},
  { path: '/admin', component: AdminHome, name: 'AdminHome', beforeEnter: authGuard},
  { path: '/admin/claim/:id', component: MerchantClaimDetail, name: 'ClaimDetail', beforeEnter: authGuard, props: true},
  { path: '/about', component: AboutUs, name: 'AboutUs' }
]

const router = new VueRouter({
  routes
});

const iodomain = process.env.NODE_ENV !== 'development' ? socketioDomain : 'http://localhost:3000';
const socket = io(iodomain);

Vue.use(VueSocketIOExt, socket);

// Use Auth0Plugin
Vue.use(Auth0Plugin, {
  domain: authConfig.domain,
  clientId: authConfig.clientId,
  audience: authConfig.audience,
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
