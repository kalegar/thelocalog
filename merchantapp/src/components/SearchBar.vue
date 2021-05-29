<template>
    <div class="input-group">
        <b-form-input v-model="searchquery" v-on:keyup="onKeyUp" class="form-control" type="text" placeholder="Search..."></b-form-input>
        <div class="input-group-append">
            <b-button type="button" variant="primary" v-if="!searchquery.length" v-on:click="emitSearch()">
                <b-icon icon="search"></b-icon>Search
            </b-button>
            <b-button type="button" variant="primary" v-else v-on:click="clearSearch()">
                <b-icon icon="x-circle"></b-icon>Clear
            </b-button>
        </div>
    </div>
</template>

<script>
import _debounce from 'lodash/debounce';

export default {
  name: 'SearchBar',
  data: function() {
      return {
          searchquery: ''
      }
  },
  watch: {
      'searchquery': function() {
          this.emitSearch();
      }
  },
  methods: {
      onKeyUp: function(e) {
          if (e.keyCode == 13) {
              this.emitSearch();
          }
      },
      clearSearch: function() {
          this.searchquery = '';
          this.$emit('search','');
      },
      emitSearch: _debounce(function() {
          this.$emit('search',this.searchquery);
      }, 500)
  }
}
</script>

<style scoped>
.b-icon {
    margin-right: 0.5rem;
}
</style>