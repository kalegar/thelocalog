<template>
    <div class="input-group">
        <b-form-input v-model="searchquery" v-on:keyup="onKeyUp" class="form-control" type="text" placeholder="Search..."></b-form-input>
        <div class="input-group-append">
            <button class="btn btn-primary" type="button" v-on:click="emitSearch()">Search</button>
        </div>
    </div>
</template>

<script>
export default {
  name: 'SearchBar',
  data: function() {
      return {
          searchquery: ''
      }
  },
  methods: {
      onKeyUp: function(e) {
          if (e.keyCode == 13) {
              this.emitSearch();
          }
      },
      emitSearch: function() {
          this.$emit('search',this.searchquery);
          this.searchquery = '';
      }
  }
}
</script>

<style scoped>
</style>