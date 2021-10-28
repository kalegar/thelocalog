<template>
  <div class="categories-div" v-if="categories.length">
      <v-combobox
        v-model="value"
        multiple
        chips
        clearable
        color="secondary"
        label="Filter by Category:"
        @change="updateInput"
        :delimiters="delimiters"
        :items="categories"
        :allow-overflow="false"
        :menu-props="menuProps"
        item-color='secondary'
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
import {MerchantService} from "../service/Merchant.service";

export default {
  name: "MerchantCategories",
  model: {
    prop: "modelValue",
    event: "change",
  },
  data: function() {
    return {
      value: [],
      categories: [],
      delimiters: [',',';']
    }
  },
  computed: {
    menuProps: function() {
      return this.$vuetify.breakpoint.mobile ? { offsetY: true, offsetOverflow: true, maxHeight: '200px' } : { offsetY: true, offsetOverflow: true };
    }
  },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    getCategories: function () {
      MerchantService.getCategories().then(res => this.categories = res, err => {
        console.log(err);
          this.error = err;
          if (err.json) {
            return err.json.then((json) => {
              this.error.message = json.message;
            });
          }
      })
      // axios
      //   .get("/api/categories")
      //   .then((res) => {
      //     if (res.status != 200) {
      //       console.log("ERROR");
      //       throw new Error(res.statusText);
      //     }
      //     this.categories = res.data.categories
      //       .map((cat) => cat.category)
      //       .filter((cat) => cat !== null)
      //       .map((cat) => {
      //         let words = cat.split(" ");
      //         return words
      //           .map(
      //             (word) =>
      //               word[0].toUpperCase() + word.toLowerCase().substring(1)
      //           )
      //           .join(" ");
      //       });
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //     this.error = err;
      //     if (err.json) {
      //       return err.json.then((json) => {
      //         this.error.message = json.message;
      //       });
      //     }
      //   });
    },
    updateInput: function (store = true) {
      this.$emit("change", this.value);
      if (store) this.save();
    },
    remove: function(item) {
        this.value.splice(this.value.indexOf(item), 1)
        this.value = [...this.value]
    },
    save: function () {
      sessionStorage.selectedMerchantCategories = this.value.join(";");
    },
  },
  mounted: function () {
    this.getCategories();
    if (sessionStorage.selectedMerchantCategories) {
      this.value = sessionStorage.selectedMerchantCategories.split(";");
      this.updateInput(false);
    }
  },
  watch: {
    modelValue: function () {
      this.value = this.modelValue;
      this.save();
    },
  },
};
</script>

<style scoped>
.category-group {
  text-align: left;
  margin-top: 2rem;
}
</style>