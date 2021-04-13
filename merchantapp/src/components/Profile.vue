<template>
    <div class="Profile">
        <BasePage>
            <template v-slot:header>
            </template>
            <BaseContent>
                    <div class="container">
                        <div class="row align-items-center profile-header">
                            <div class="col-md-2 mb-3">
                                <img
                                :src="$auth.user.picture"
                                alt="User's profile picture"
                                class="rounded-circle img-fluid profile-picture"
                                />
                                
                            </div>
                            <div class="col-md text-center text-md-left">
                                <h2>{{ $auth.user.name }}</h2>
                                <p class="lead text-muted">{{ $auth.user.email }}</p>
                            </div>
                            </div>

                            <div class="row">
                            <!-- <highlightjs autodetect :code="JSON.stringify($auth.user, null, 2)" class="rounded w-100" /> -->
                        </div>
                    </div>
            </BaseContent>
        </BasePage>
    </div>
</template>

<script>
import BasePage from './BasePage.vue';
import BaseContent from './BaseContent.vue';

export default {
    name: 'Profile',
    components: {
        BasePage,
        BaseContent
    }
}
</script>

<style scoped>

</style>