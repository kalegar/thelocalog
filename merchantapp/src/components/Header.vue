<template>
    <div class="container-fluid header shadow-lg fixed-top">
        <div class="row mh-100">
            <div class="col">
                <router-link to="/">
                <img alt="Vue logo" v-on:click="$emit('headerclicked')" src="../assets/logo.jpg"/>
                </router-link>
            </div>
            <div class="col-6 align-self-center">
                <slot></slot>
            </div>
            <div class="col">
            </div>
        </div>
    </div>
</template>

<script>

export default {
  name: 'Header'
}
</script>

<style scoped>
.header {
  background-color: rgb(234,60,51);
  height: 80px;
  box-shadow: 0 8px 4px 0 rgba(0, 0, 0, 0.349), 0 2px 8px 0 rgba(0, 0, 0, 0.486);
}
img {
    max-height: 80px;
    float: left;
    margin-left: 24px;
}
@media only screen and (max-width: 600px) {
    img {
        margin-left: 0px;
    }
}
.left {
    width: 150px;
    margin-left: 24px;
    text-align: left; 
}
.center {
  max-width: 600px;
  height: 80px;
  margin: auto auto;
  flex-grow: 2;
  align-self: center;
}
.right {
    text-align: right;
    margin-right: 24px;
    width: 150px;
}
</style>