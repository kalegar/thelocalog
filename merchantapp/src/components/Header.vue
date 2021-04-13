<template>
    <div class="container-fluid header shadow-lg fixed-top">
        <div class="row mh-100">
            <div class="col">
                <router-link to="/">
                <img alt="Localog Logo" v-on:click="$emit('headerclicked')" src="../assets/logo.svg"/>
                </router-link>
            </div>
            <div class="col-6 align-self-center">
                <slot></slot>
            </div>
            <div class="col align-self-center">
                <div class="auth" v-if="!$auth.loading">
                    <b-button variant="primary" v-if="!$auth.isAuthenticated" v-on:click="login()">Log In</b-button>
                    <b-button-group v-else>
                        <b-button variant="primary" to="profile"><b-icon icon="person-circle"></b-icon> Profile</b-button>
                        <b-dropdown right variant="primary">
                            <b-dropdown-item v-on:click="logout()">Log Out</b-dropdown-item>
                        </b-dropdown>
                    </b-button-group>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

export default {
  name: 'Header',
  methods: {
      login: function() {
          this.$auth.loginWithRedirect();
      },
      logout: function() {
          this.$auth.logout({
            returnTo: window.location.origin
          });
      }
  }
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
    padding: 8px;
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
.auth {
    float: right;
    margin-right: 1rem;
}
</style>