<template>
    <div class="container-fluid content">
        <div class="row">
            <div class="d-none d-md-block col-md-4 col-xl-3" align = "center">
                <slot name="left"></slot>
            </div>
            <div class="col-xs-12 col-md-8 col-xl-7" align="center">
                <slot></slot>
            </div>
            <div class="d-none d-xl-block col-xl-2" align="center">
                <slot name="right"></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'BaseContent'
}
</script>

<style scoped>
.content {
    background-color:#F1F1F1;
    padding-top: 80px;
}
</style>