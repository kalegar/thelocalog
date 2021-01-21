<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col" align = "center">
                <slot name="left"></slot>
            </div>
            <div class="col-6" align="center">
                <slot></slot>
            </div>
            <div class="col" align="center">
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