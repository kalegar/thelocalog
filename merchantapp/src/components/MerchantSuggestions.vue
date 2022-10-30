<template>
  <div>
    <v-card v-if="loading">
      <v-card-text>
        <v-progress-circular
          indeterminate
          color="secondary"
        ></v-progress-circular>
      </v-card-text>
    </v-card>
    <v-card v-else-if="suggestions && suggestions.length">
      <v-card-text>
        <v-list>
          <v-subheader class="mt-n4">Suggestions</v-subheader>
          <v-list-group
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            v-model="suggestion.active"
            prepend-icon="mdi-storefront"
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title
                  class="suggestion-title"
                >{{suggestion.title}}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <create-merchant-modal
                  text="Create Merchant"
                  :title="suggestion.title"
                ></create-merchant-modal>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn
                  color="primary"
                  text
                  :disabled="deleting"
                  @click="confirmDeleteSuggestion(suggestion)"
                  >Delete</v-btn
                >
              </v-list-item-action>
            </template>

            <v-list-item>
              <v-list-item-content class="suggestion">
                <v-list-item-title class="h5"
                  >Shop Title: {{ suggestion.title }}</v-list-item-title
                >
                <v-list-item-subtitle v-if="suggestion.email"
                  >Sent By: {{ suggestion.email }}</v-list-item-subtitle
                >
                <v-list-item-subtitle
                  >Suggested Category:
                  {{ suggestion.category }}</v-list-item-subtitle
                >
                <v-list-item-subtitle>Extra Info:</v-list-item-subtitle>
                <v-list-item-subtitle
                  v-for="(value, name) in suggestion.extraInfo"
                  :key="name"
                >
                  - {{ name }}: {{ value }}</v-list-item-subtitle
                >
                <v-list-item-subtitle
                  >Created:
                  {{ suggestion.createdAtString }}</v-list-item-subtitle
                >
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
        </v-list>
      </v-card-text>
    </v-card>
    <v-card v-else>
      <v-card-text> There are no suggestions. </v-card-text>
    </v-card>
    <v-dialog v-model="deleteSuggestionDialog" max-width="450">
      <v-card>
        <v-card-title
          >Delete Suggestion '{{ toDeleteSuggestion.title }}'</v-card-title
        >
        <v-card-text
          >Are you sure you want to delete '{{ toDeleteSuggestion.title }}'?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteSuggestionDialog = false">Cancel</v-btn>
          <v-btn
            text
            @click="
              deleteSuggestion(toDeleteSuggestion.id);
              deleteSuggestionDialog = false;
            "
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { AdminService } from "../service/Admin.service";
import { MerchantService } from "../service/Merchant.service";
import CreateMerchantModal from './CreateMerchantModal.vue';

export default {
  components: { CreateMerchantModal },
  name: "MerchantSuggestions",
  data: function () {
    return {
      loading: false,
      suggestions: [],
      deleting: false,
      deleteSuggestionDialog: false,
      toDeleteSuggestion: {},
    };
  },
  methods: {
    getSuggestions: function () {
      this.loading = true;
      this.$auth
        .getTokenSilently()
        .then((authToken) => {
          MerchantService.getMerchantSuggestions(authToken)
            .then(
              (res) => {
                this.suggestions = res.suggestions.map((s) => {
                  s.createdAtString = new Date(s.createdAt).toLocaleString();
                  s.extraInfo = JSON.parse(s.extra);
                  s.active = false;
                  return s;
                });
              },
              (rej) => {
                console.log(rej);
              }
            )
            .finally(() => {
              this.loading = false;
            });
        })
        .catch((err) => console.log(err));
    },
    confirmDeleteSuggestion(aSuggestion) {
      this.toDeleteSuggestion = aSuggestion;
      this.deleteSuggestionDialog = true;
    },
    deleteSuggestion: function (id) {
      if (this.deleting) return;
      if (id == null) return;
      this.deleting = true;
      this.$auth.getTokenSilently().then((authToken) => {
        AdminService.deleteMerchantSuggestion(id, authToken)
          .then(
            () => {
              this.getSuggestions();
            },
            (rej) => {
              console.log(rej);
            }
          )
          .finally(() => {
            this.deleting = false;
          });
      });
    },
  },
  mounted: function () {
    this.getSuggestions();
  },
  created: function () {
    this.loading = true;
  },
};
</script>

<style scoped>
.suggestion,
.suggestion-title {
  text-align: left !important;
}
</style>