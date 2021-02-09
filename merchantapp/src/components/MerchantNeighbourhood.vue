<template>
    <div class="neighbourhood-div">
        <label for="merchant-neighbourhood">Filter by Neighbourhood:</label>
        <b-form-input id="merchant-neighbourhood" v-model="selected" placeholder="Neighbourhood"></b-form-input>
    </div>
</template>

<script>
import _debounce from 'lodash/debounce';

export default {
    name: 'MerchantNeighbourhood',
    data: function() {
        return {
            selected: ''
        }
    },
    watch: {
        "selected": _debounce(function() {
            this.$emit('neighbourhood',this.selected);
        }, 500)
    }
}
</script>

<style scoped>
.neighbourhood-div {
    margin-top: 2rem;
    text-align: left;
}
</style>