<template>
    <div class="neighbourhood-div">
        <v-combobox
          v-model="chips"
          multiple
          chips
          clearable
          color="secondary"
          label="Filter by Neighbourhood:"
          :delimiters="delimiters"
          :items="neighbourhoods"
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

<script>
import axios from 'axios';
import _debounce from 'lodash/debounce';

export default {
    name: 'MerchantNeighbourhood',
    data: function() {
        return {
            chips: '',
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
            this.chips.splice(this.chips.indexOf(item), 1)
            this.chips = [...this.chips]
        }
    },
    watch: {
        "chips": _debounce(function() {
            this.$emit('change',this.chips);
            localStorage.selectedMerchantNeighbourhood = this.chips.join(';');
        }, 500)
    },
    mounted: function() {
        this.getNeighbourhoods();
        if (localStorage.selectedMerchantNeighbourhood) {
            this.chips = localStorage.selectedMerchantNeighbourhood.split(';');
        }
    }
}
</script>

<style scoped>
.neighbourhood-div {
    text-align: left;
}
</style>