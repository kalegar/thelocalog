import Vue from 'vue';
import Vuetify from 'vuetify/lib';

import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: colors.red.darken3,
                secondary: '#0b5a83',
                background: '#F1F1F1',
                success: colors.green.darken1,
                danger: colors.red
            },
            dark: {
                primary: colors.red.darken3,
                secondary: '#0b5a83',
                background: '#313131',
                success: colors.green.lighten1,
                danger: colors.red
            }
        }
    }
});
