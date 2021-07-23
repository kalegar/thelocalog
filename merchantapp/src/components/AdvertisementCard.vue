<template>
  <v-hover v-slot:default="{ hover }">
    <v-card
      max-width="400"
      height="100%"
      outlined
      dense
      shaped
      :elevation="hover ? 12 : 4"
    >
      <slot>ADVERTISEMENT</slot>
    </v-card>
  </v-hover>
</template>

<script>
export default {
  name: "AdvertisementCard",
};
</script>