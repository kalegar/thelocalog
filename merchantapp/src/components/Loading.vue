<template>
    <div v-if="loading" class="w-100 d-flex justify-content-center align-items-center">
        <div class="loading spinner-border text-primary">
        </div>
    </div>
</template>

<script>
export default {
    name: 'Loading',
    props: {
        loading: Boolean
    }
}
</script>

<style scoped>
.loading {
  display: inline-block;
  width: 1rem;
  height: 1rem;
}
</style>