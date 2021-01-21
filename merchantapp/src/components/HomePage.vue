<template>
  <div class="home container-fluid">
    <div class="row">
      <div class="col">
      </div>
      <div class="col-6 align-self-center">
        <Merchants v-bind:perpage="perpage"/>
      </div>
      <div class="col" align="center">
        <div class="dropdown">
          <b-dropdown id="itemsperpage" :text="perpage + ' Results Per Page'" class="m-md-2">
            <b-dropdown-item v-on:click="perpage = 10">10</b-dropdown-item>
            <b-dropdown-item v-on:click="perpage = 25">25</b-dropdown-item>
            <b-dropdown-item v-on:click="perpage = 50">50</b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Merchants from './Merchants.vue'

export default {
  name: 'HomePage',
  props: {

  },
  components: {
    Merchants
  },
  data: function() {
    return {
      perpage: 10
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.home {
  margin-top: 24px;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.dropdown-menu {
  width: 40px;
}
</style>
