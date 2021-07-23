<template>
    <base-page>
        <base-content>
            <h1>Review Claim</h1>
        </base-content>
    </base-page>
</template>

<script>
import BaseContent from './base/BaseContent.page.vue';
import BasePage from './base/BasePage.page.vue';

export default {
  components: { BasePage, BaseContent },
    name: 'MerchantClaimDetail',
    props: {
        id: String
    }
}
</script>