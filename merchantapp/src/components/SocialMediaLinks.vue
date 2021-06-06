<template>
    <v-row class="social-media-links">
        <v-col v-for="link in links" :key="link.id">
            <v-btn icon rounded :color="getColor(link.name)" :href="link.url" target="_blank">
                <v-icon :large="large">{{getSocialIcon(link.name)}}</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script>

const Icons = {
    TWITTER: {icon:'mdi-twitter', color: '#00aced'},
    FACEBOOK: {icon:'mdi-facebook', color: '#3b5998'},
    INSTAGRAM: {icon:'mdi-instagram', color: '#833AB4'},
    PINTEREST: {icon:'mdi-pinterest', color: '#E60023'}
}

export default {
    name: 'SocialMediaLinks',
    props:  {
        links: Array,
        large: {
            type: Boolean,
            default: true
        }
    },
    methods: {
        getColor: function(name) {
            if (Icons[name.toUpperCase()]) {
                return Icons[name.toUpperCase()].color;
            }
            return false;
        },
        getSocialIcon: function(name) {
            if (Icons[name.toUpperCase()]) {
                let icon = Icons[name.toUpperCase()];
                return icon.icon;
            }
            return 'link45deg';
        }
    }
}
</script>