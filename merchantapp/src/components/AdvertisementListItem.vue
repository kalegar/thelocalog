<template>
  <v-hover v-slot:default="{ hover }">
    <v-list-item
        :elevation="hover ? 4 : 0"
    >
        <v-list-item-content class="merchant-list-item">
        <h3>Advertisement!</h3>
        <v-list-item-subtitle>
            Advertisement goes here.
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-hover>
</template>

<script>
export default {
  name: "AdvertisementListItem",
};
</script>