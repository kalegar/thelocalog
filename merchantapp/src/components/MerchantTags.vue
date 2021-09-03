<template>
    <div class="tag-div">
        <v-combobox
          v-model="value"
          multiple
          chips
          clearable
          color="secondary"
          label="Filter by Keyword(s):"
          @change="updateInput"
          :delimiters="delimiters"
          append-icon=""
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
    model: {
      prop: 'modelValue',
      event: 'change'
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
            delimiters: [' ',',',';']
        }
    },
    watch: {
      "modelValue": function() {
        this.value = this.modelValue;
        this.save();
      }
    },
    methods: {
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
        localStorage.selectedMerchantTags = this.value.join(';');
      }
    },
    mounted: function() {
        if (localStorage.selectedMerchantTags) {
            this.value = localStorage.selectedMerchantTags.split(';');
            this.updateInput(false);
        }
    }
}
</script>

<style scoped>
.tag-div {
    text-align: left;
}
</style>