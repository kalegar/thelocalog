<template>
    <div class="tag-div">
        <v-combobox
          v-model="chips"
          multiple
          chips
          clearable
          color="secondary"
          label="Filter by Keyword(s):"
          :delimiters="delimiters"
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
export default {
    name: 'MerchantTags',
    data: function() {
        return {
            chips: [],
            delimiters: [' ',',',';']
        }
    },
    methods: {
      remove: function(item) {
        this.chips.splice(this.chips.indexOf(item), 1)
        this.chips = [...this.chips]
      },
    },
    watch: {
        "chips": function() {
            this.$emit('change',this.chips);
            localStorage.selectedMerchantTags = this.chips.join(';');
        }
    },
    mounted: function() {
        if (localStorage.selectedMerchantTags) {
            this.chips = localStorage.selectedMerchantTags.split(';');
        }
    }
}
</script>

<style scoped>
.tag-div {
    text-align: left;
}
</style>