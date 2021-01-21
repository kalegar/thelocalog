import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

import './app.scss'

Vue.config.productionTip = false

Vue.use(VueRouter);
// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);

import Merchants from './components/Merchants.vue'
import MerchantDetail from './components/MerchantDetail.vue'

const routes = [
  { path: '/', redirect: '/merchants' },
  { path: '/merchants', component: Merchants },
  { path: '/merchants/:id', component: MerchantDetail, name: 'MerchantDetail', props: true }
]

const router = new VueRouter({
  routes
})

new Vue({
  render: h => h(App),
  router
}).$mount('#app')

// new Vue({
//   render: h => h(App),
// }).$mount('#app')
