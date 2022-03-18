<template>
    <div class="AboutUs">
        <base-page>
            <base-content>
                <v-container>
                    <v-row>
                        <v-col>
                            <h2>About Us</h2>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col
                            v-for="(section,index) in sections"
                            :key="index"
                            cols=12
                        >
                            <h3 class="title">{{section.title}}</h3>
                            <p
                                class="paragraph"
                                v-for="(paragraph,p_index) in section.paragraphs"
                                :key="p_index"
                            >{{paragraph}}</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-btn
                              color="primary"
                              @click="$router.go(-1)"
                            >Back</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </base-content>
        </base-page>
    </div>
</template>

<script>
import BasePage from './base/BasePage.page.vue'
import BaseContent from "./base/BaseContent.page.vue";
export default {
  components: { BasePage, BaseContent },
  name: 'AboutUs',
  data: function() {
      return {
          sections: [
              {
                  title: 'The What',
                  paragraphs: [
                      `The Localog just wants to be the best listing of local goods, products and services by helping you find what you need quickly and intuitively. `,
                      `The side benefit is that we support our local businesses. And that’s pretty important because those local businesses are part of who we are: they shape our City’s culture and contribute to our contemporary and historic geographical identities. In Edmonton, that’s The Gateway to the North, The City of Champions, and Alberta’s academic and arts hub. `
                  ]
              },
              {
                  title: `The Why`,
                  paragraphs: [
                      `The idea of a search engine that only returned goods, products and services from local businesses was borne out of the frustration with popular search engines that only returned results from big box stores. Also, one of us really likes to shop, and despite a plethora of keyword combinations, those search engines just would not locate brown oxford shoes in Edmonton. Ugh. `,
                      `We knew that some search engines were definitely incentivized to list big box stores first to potential customers. I mean, they have their bottom line, right?! But by doing so, the big search engines aren’t prioritizing the consumer’s best interest nor the local economy’s. (Plus, certain sites named after jungles are often more expensive than local merchants…not even kidding). `
                  ]
              },
              {
                  title: `The Who`,
                  paragraphs: [
                      `We thought the solution to this conundrum was within our skills sets. This is kinda what we do… one of us studies information systems, while the other builds them. Right now, we do this as a side hustle, on our own time with our own monies. And that’s a-ok, but we would super love it if you supported us by telling us what we’ve missed, when we are dead wrong, what we do well and most importantly, by using our search and sharing it with your friends. `,
                      `This is just the first step of a much bigger plan for The Localog. Muahaha. `
                  ]
              }
          ]
      }
  },
  mounted: function() {
    window.scrollTo(0,0); 
  }
}
</script>

<style scoped>
    .title {
        text-align: left;
    }
    .paragraph {
        text-align: left;
    }
</style>