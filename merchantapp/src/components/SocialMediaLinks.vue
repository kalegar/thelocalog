<template>
    <v-container class="social-media-links">
    <v-row v-if="!editing">
        <v-col v-for="link in links" :key="link.id">
            <v-btn icon rounded :color="getColor(link.name)" :href="link.url" target="_blank">
                <v-icon :large="large">{{getSocialIcon(link.name)}}</v-icon>
            </v-btn>
        </v-col>
        <v-col v-if="canEdit">
            <v-btn fab @click="startEditing" small><v-icon small>mdi-pencil</v-icon></v-btn>
        </v-col>
    </v-row>
    <v-row v-else>
        <v-col v-for="link in linksArray" :key="link.id">
            <v-card max-width="250px">
                <v-card-title>
                    <v-select
                        v-model="link.displayName"
                        :items="linkTypes"
                        v-on:change="link.name = $event.toUpperCase()"
                        dense
                        label="Type"
                        color="secondary"
                        item-color="secondary"
                    >
                    <template v-slot:prepend>
                        <v-icon :color="getColor(link.name)">{{getSocialIcon(link.name)}}</v-icon>
                    </template>
                    </v-select>
                </v-card-title>
                <v-card-text>
                    <v-text-field dense v-model="link.url" label="URL" color="secondary"></v-text-field>
                </v-card-text>
                <div class="d-flex justify-center mt-n7" v-show="!saveLoading">
                    <v-btn fab @click="deleteSocialMediaLink(link)" small class="mx-1 mb-n4" color="red darken-1" :loading="deleteLoading === link.id" :disabled="deleteLoading.length > 0"><v-icon small>mdi-delete</v-icon></v-btn>
                </div>
            </v-card>
        </v-col>
        <v-col class="d-flex justify-center align-center">
            <v-btn fab @click="addSocialMediaLink" class="mx-1" :loading="saveLoading" :disabled="saveLoading || deleteLoading.length > 0"><v-icon>mdi-plus</v-icon></v-btn>
            <v-btn fab @click="saveLinks"          class="mx-1" :loading="saveLoading" :disabled="saveLoading || deleteLoading.length > 0"><v-icon>mdi-content-save</v-icon></v-btn>
            <v-btn fab @click="cancelEditing"      class="mx-1" :loading="saveLoading" :disabled="saveLoading || deleteLoading.length > 0"><v-icon>mdi-cancel</v-icon></v-btn>
        </v-col>
    </v-row>
    </v-container>
</template>

<script>

import { MerchantService } from '../service/Merchant.service.js';

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
        },
        canEdit: {
            type: Boolean,
            default: false
        },
        merchantId: {
            type: String,
            default: ''
        }
    },
    data: function() {
        return {
            editing: false,
            saveLoading: false,
            newLinks: [],
            deleteLoading: '',
            linkTypes: ['Twitter','Facebook','Instagram','Pinterest']
        }
    },
    computed: {
        linksArray: function() {
            return [].concat(this.links && Array.isArray(this.links) ? this.links : []).concat(this.newLinks);
        }
    },
    methods: {
        getColor: function(name) {
            if (Icons[name.toUpperCase()]) {
                return Icons[name.toUpperCase()].color;
            }
            return '#aaaaaa';
        },
        getSocialIcon: function(name) {
            if (Icons[name.toUpperCase()]) {
                let icon = Icons[name.toUpperCase()];
                return icon.icon;
            }
            return 'mdi-help-circle';
        },
        deleteSocialMediaLink: function(link) {
            this.deleteLoading = link.id;
            for (let i = this.newLinks.length-1; i >= 0; i--) {
                const aLink = this.newLinks[i];
                if (aLink.id === link.id) {
                    this.newLinks.splice(i,1);
                    this.deleteLoading = '';
                    return;
                }
            }
            for (let i = this.links.length-1; i >= 0; i--) {
                const aLink = this.links[i];
                if (aLink.id === link.id) {
                    this.$auth.getTokenSilently().then((authToken) => {
                        MerchantService.deleteSocialMediaLink(this.merchantId, authToken, link.id).then(
                            () => {
                                this.links.splice(i,1);
                            },
                            (err) => {
                                console.log(err);
                            }
                        ).then(() => this.deleteLoading = '');
                    }).catch(() => this.deleteLoading = '');
                    return;
                }
            }
        },
        addSocialMediaLink: function() {
            this.newLinks.push({
                MerchantId: this.merchantId,
                displayName: this.linkTypes[0],
                name: this.linkTypes[0].toUpperCase(),
                url: '',
                id: 'N' + this.newLinks.length.toString()
            });
        },
        startEditing: function() {
            if (this.canEdit) {
                this.editing = true;
            }
        },
        saveLinks: function() {
            this.saveLoading = true;
            this.$auth.getTokenSilently().then((authToken) => {
                Promise.all([
                    MerchantService.saveSocialMediaLinks(this.merchantId, authToken, this.links),
                    MerchantService.addSocialMediaLinks(this.merchantId, authToken, this.newLinks)
                    ])
                .then(
                    (result) => {
                        this.$emit('save-success',result);
                    },
                    (err) => {
                        this.$emit('save-error',err);
                    }
                )
                .then(() => {
                    this.newLinks = [];
                    this.saveLoading = false;
                    this.editing = false;
                });
                
            });
        },
        cancelEditing: function() {
            this.editing = false;
            this.newLinks = [];
        }
    }
}
</script>