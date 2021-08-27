<template>
    <v-container fluid>
        <v-row :dense="$vuetify.breakpoint.mobile" :no-gutters="$vuetify.breakpoint.mobile">
            <v-col cols="12" md="4" lg="3" align = "center">
                <slot name="left"></slot>
            </v-col>
            <v-col cols="12" md="8" lg="9" xl="7" align="center">
                <slot></slot>
            </v-col>
            <v-col cols="2" class="d-none d-xl-block" align="center">
                <slot name="right"></slot>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: 'BaseContent'
}
</script>

<style scoped>
.content {
    background-color:#F1F1F1;
}
</style>