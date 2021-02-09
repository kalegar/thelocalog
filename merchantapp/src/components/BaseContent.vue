<template>
    <div class="container-fluid content">
        <div class="row">
            <div class="d-none d-sm-block col-sm-3" align = "center">
                <slot name="left"></slot>
            </div>
            <div class="col-xs-12 col-sm-6" align="center">
                <slot></slot>
            </div>
            <div class="d-none d-sm-block col-sm-3" align="center">
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