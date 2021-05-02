<template>
    <div class="AdminHome">
        <BasePage>
            <template v-slot:header>
            </template>
            <BaseContent>
            <div class="container mt-3" v-if="isAdmin">
                <div class="row">
                    <div class="col">
                        <h1>Admin</h1>
                    </div>
                </div>
            </div>
            </BaseContent>
        </BasePage>
    </div>
</template>

<script>
import axios from 'axios';
import BasePage from './BasePage.vue';
import BaseContent from './BaseContent.vue';

export default {
    name: 'AdminHome',
    components: {
        BasePage,
        BaseContent
    },
    data: function() {
        return {
            claims: [],
            isAdmin: false
        }
    },
    methods: {
        getClaims: function() {
            const url = `/api/admin/claims`
            this.$auth.getTokenSilently().then((authToken) => {
                axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                })
                .then(res => {
                    if (res.status != 200) {
                        console.log('ERROR');
                        const error = new Error(res.statusText);
                        throw error;
                    }
                    console.log(res.data);
                })
                .catch(err => {
                    this.error = err;
                    if (err.json) {
                        return err.json.then(json => {
                            this.error.message = json.message;
                        });
                    }
                });
            });
        }
    },
    updated: function() {
        document.title = 'Admin - The Localog';
    },
    mounted: function() {
        this.isAdmin = false;
        const url = `/api/admin`
        this.$auth.getTokenSilently().then((authToken) => {
            axios.get(url, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            .then(res => {
                if (res.status != 200) {
                    this.$router.push('Merchants');
                    return;
                }else{
                    this.isAdmin = true;
                    this.getClaims();
                }
            })
            .catch(() => {
                this.$router.push('Merchants');
            });
        });
    }
}
</script>

<style scoped>
</style>