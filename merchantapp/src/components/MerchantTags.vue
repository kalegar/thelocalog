<template>
    <div class="tag-div">
        <label for="merchant-tags">Filter by Keyword(s):</label>
        <b-form-tags input-id="merchant-tags" v-model="selected" separator=" ,;"></b-form-tags>
    </div>
</template>

<script>
export default {
    name: 'MerchantTags',
    data: function() {
        return {
            selected: []
        }
    },
    watch: {
        "selected": function() {
            this.$emit('tags',this.selected);
        }
    }
}
</script>

<style scoped>
.tag-div {
    margin-top: 2rem;
    text-align: left;
}
</style>