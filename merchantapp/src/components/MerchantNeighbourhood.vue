<template>
    <div class="neighbourhood-div">
        <v-text-field v-model="selected" label="Filter by Neighbourhood" color="secondary"></v-text-field>
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
            localStorage.selectedMerchantNeighbourhood = this.selected;
        }, 500)
    },
    mounted: function() {
        if (localStorage.selectedMerchantNeighbourhood) {
            this.selected = localStorage.selectedMerchantNeighbourhood;
        }
    }
}
</script>

<style scoped>
.neighbourhood-div {
    text-align: left;
}
</style>