<template>
    <div class="neighbourhood-div">
        <v-combobox
          v-model="value"
          multiple
          chips
          clearable
          color="secondary"
          item-color="secondary"
          label="Filter by Neighbourhood:"
          @change="updateInput"
          :delimiters="delimiters"
          :items="neighbourhoods"
          :allow-overflow="false"
          :menu-props="menuProps"
        >
          <template v-slot:selection="{ attrs, item, select, selected }">
            <v-chip
              v-bind="attrs"
              :input-value="selected"
              close
              @click="select"
              @click:close="remove(item)"
            >
              <strong>{{ item }}</strong>
            </v-chip>
          </template>
        </v-combobox>
    </div>
</template>

<script lang="ts">
import axios from 'axios';

import Vue from 'vue'
export default Vue.extend({
    name: 'MerchantNeighbourhood',
    model: {
      prop: 'modelValue',
      event: 'change'
    },
    computed: {
      menuProps: function() {
        return this.$vuetify.breakpoint.mobile ? { offsetY: true, offsetOverflow: true, maxHeight: '200px' } : { offsetY: true, offsetOverflow: true };
      }
    },
    props: {
      modelValue: {
        type: Array,
        default: () => []
      }
    },
    data: function() {
        return {
            value: [],
            neighbourhoods: [],
            delimiters: [',',';']
        }
    },
    methods: {
        getNeighbourhoods: function() {
            axios.get('/api/addresses/neighbourhoods'
            ).then(res => {
                if (res.status != 200) {
                    console.log('ERROR');
                    throw new Error(res.statusText);
                }
                this.neighbourhoods = res.data.neighbourhoods.map((cat) => {let words = cat.split(" "); return words.map((word) => word[0].toUpperCase() + word.toLowerCase().substring(1)).join(" ")});
            })
            .catch(err => {
                console.log(err);
            });
        },
        remove: function(item) {
            this.value.splice(this.value.indexOf(item), 1)
            this.value = [...this.value]
        },
        updateInput: function(store = true) {
            this.$emit('change',this.value);
            if (store)
                this.save();
        },
        save: function() {
            sessionStorage.selectedMerchantNeighbourhood = this.value.join(';');
        }
    },
    watch: {
      "modelValue": function() {
        this.value = this.modelValue;
        this.save();
      }
    },
    mounted: function() {
        this.getNeighbourhoods();
        if (sessionStorage.selectedMerchantNeighbourhood) {
            this.value = sessionStorage.selectedMerchantNeighbourhood.split(';');
            this.updateInput(false);
        }
    }
});
</script>

<style scoped>
.neighbourhood-div {
    text-align: left;
}
</style>