<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App'
}
</script>

<style>
@font-face {
  font-family: "Assistant";
  src: local("Assistant"),
    url(./assets/fonts/assistant/Assistant-Regular.ttf) format("truetype");
}
#app {
  font-family: Assistant, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
