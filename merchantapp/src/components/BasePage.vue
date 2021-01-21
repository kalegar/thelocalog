<template>
    <div class="base">
        <Header v-on:headerclicked="$emit('headerclicked')">
            <slot name="header"></slot>
        </Header>
        <slot></slot>
    </div>
</template>

<script>
import Header from './Header.vue'

export default {
    name: 'BasePage',
    components: {
        Header
    }
}
</script>