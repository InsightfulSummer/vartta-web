<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
    <v-row class="text-left mt-1">
      <v-col
        cols="2"
        class="d-flex flex-column justify-start align-center centered"
      >
        <div>
          <v-avatar>
            <img
              :src="tweet.user.profile_image_url_https || '/person.png'"
              :alt="tweet.user.screen_name"
            />
          </v-avatar>
        </div>
        <div>
          <v-btn
            alt="Pin/unpin tweet"
            icon
            small
            text
            color="brown"
            @click="clicked"
          >
            <v-icon small>mdi-{{ selected ? 'pin' : 'pin-outline' }}</v-icon>
          </v-btn>
        </div>
        <div>
          <v-dialog v-model="dialog" max-width="500px">
            <template #activator="{ on }">
              <v-btn text icon small color="error" v-on="on">
                <v-icon small>mdi-circle-edit-outline</v-icon>
              </v-btn>
            </template>
            <v-card flat>
              <v-card-title>
                <span class="text-h6">Edit Tweet Labeling</span>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-row dense no-gutters>
                  <!-- eslint-disable vue/no-v-html  -->
                  <v-col cols="12" v-html="decoratedText"></v-col>
                  <v-col cols="6">
                    <v-combobox
                      v-model="customGroup"
                      :items="groups"
                      chips
                      label="User Category"
                      clearable
                    >
                      <template #selection="data">
                        <v-chip
                          :key="JSON.stringify(data.item)"
                          :selected="data.selected"
                          @click.stop="data.parent.selectedIndex = data.index"
                          @input="data.parent.selectItem(data.item)"
                        >
                          <v-icon left>mdi-account</v-icon>
                          {{ data.item }}
                        </v-chip>
                      </template>
                    </v-combobox>
                  </v-col>
                  <v-col cols="6">
                    <v-combobox
                      v-model="customTheme"
                      :items="themes"
                      chips
                      label="Content Theme"
                      clearable
                    >
                      <template #selection="data">
                        <v-chip
                          :key="JSON.stringify(data.item)"
                          :selected="data.selected"
                          @click.stop="data.parent.selectedIndex = data.index"
                          @input="data.parent.selectItem(data.item)"
                        >
                          <v-icon left>mdi-tag</v-icon>
                          {{ data.item }}
                        </v-chip>
                      </template>
                    </v-combobox>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDialog(false)">
                  Close
                </v-btn>
                <v-btn color="blue darken-1" text @click="closeDialog(true)">
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </v-col>
      <v-col cols="10">
        <div class="justify-start align-center">
          <div
            class="text-truncate"
            style="max-width: 85%; display: inline-block"
          >
            <a
              style="text-decoration: none; color: unset !important"
              :href="'https://twitter.com/' + tweet.user.screen_name"
              target="_blank"
            >
              <span class="font-weight-bold">
                {{ tweet.user.name }}
              </span>
              <v-icon
                v-if="tweet.user.verified"
                color="primary"
                small
                class="subheading"
              >
                mdi-check-decagram
              </v-icon>
              <span class="text--grey">@{{ tweet.user.screen_name }}</span>
            </a>
          </div>
          <span class="text-caption">· {{ niceDate }}</span>
        </div>
        <div class="justify-start align-center">
          <!-- eslint-disable vue/no-v-html  -->
          <div class="text-body-2" v-html="decoratedText"></div>
        </div>
        <v-btn block text @click="expand = !expand">
          <v-icon>{{
            expand ? 'mdi-chevron-double-up' : 'mdi-chevron-double-down'
          }}</v-icon>
        </v-btn>
      </v-col>
      <v-col v-if="expand" cols="12" class="pt-0">
        <v-tabs v-model="active" centered grow>
          <v-tab ripple>
            <v-icon>mdi-emoticon</v-icon>
          </v-tab>
          <v-tab ripple>
            <v-icon>mdi-account</v-icon>
          </v-tab>
          <v-tab-item>
            <v-data-table
              :headers="[
                {
                  text: 'Method',
                  value: 'id',
                  align: 'center',
                  class: 'body-1',
                },
                { text: 'Result', value: 'result', align: 'center' },
              ]"
              :items="sortedAnalysis"
              hide-default-header
              hide-default-footer
              class="elevation-1"
            >
              <!-- eslint-disable-next-line vue/valid-v-slot -->
              <template #item.result="{ item }">
                <v-chip :color="item.result > 0 ? 'green' : 'orange'" outlined>
                  <v-icon left>
                    mdi-emoticon-{{
                      item.result > 0 ? 'happy-outline' : 'sad-outline'
                    }}
                  </v-icon>
                  <strong>{{ (+item.result).toPrecision(2) }}</strong>
                </v-chip>
              </template>
            </v-data-table>
          </v-tab-item>
          <v-tab-item>
            <v-data-table
              :headers="[
                { text: 'Method', value: 'id' },
                { text: 'Group', value: 'result.group' },
                { text: 'Theme', value: 'result.theme' },
              ]"
              :items="sortedLabels"
              hide-default-header
              hide-default-footer
              class="elevation-1"
            >
              <!-- eslint-disable-next-line vue/valid-v-slot -->
              <template #item.result.group="{ item }">
                <v-chip :color="colorScale(item.result.group)" outlined>
                  <v-icon left>mdi-account-circle</v-icon>
                  <span class="text-overline">
                    {{ item.result.group }}
                  </span>
                </v-chip>
              </template>
              <!-- eslint-disable-next-line vue/valid-v-slot -->
              <template #item.result.theme="{ item }">
                <v-chip :color="colorScale(item.result.theme)" outlined>
                  <v-icon left>mdi-tag</v-icon>
                  <span class="text-overline">
                    {{ item.result.theme }}
                  </span>
                </v-chip>
              </template>
            </v-data-table>
          </v-tab-item>
        </v-tabs>
      </v-col>
    </v-row>
    <v-divider></v-divider>
  </div>
  <!--  <v-col cols="12">-->
  <!--    <v-card-->
  <!--      hover-->
  <!--      class="`elevation-${hover ? 12 : 2}`"-->
  <!--      :color="!contextMenu && selected ? 'blue lighten-5' : 'white'"-->
  <!--      style="flex: initial !important; overflow: hidden;"-->
  <!--    >-->
  <!--      <v-card-actions>-->
  <!--        <v-list-tile class="grow" style="max-width: 70%;">-->
  <!--          <v-list-tile-avatar>-->
  <!--            <v-img-->
  <!--              class="elevation-6"-->
  <!--              :src=""-->
  <!--            ></v-img>-->
  <!--          </v-list-tile-avatar>-->

  <!--          <v-list-tile-content style="margin-left: -4px;">-->
  <!--            <v-list-tile-title>{{ tweet.user.name }}</v-list-tile-title>-->
  <!--            <v-list-tile-sub-title class="caption">-->

  <!--            </v-list-tile-sub-title>-->
  <!--          </v-list-tile-content>-->
  <!--          &lt;!&ndash;            <v-spacer></v-spacer>&ndash;&gt;-->
  <!--          &lt;!&ndash;            <v-layout align-center justify-end>&ndash;&gt;-->
  <!--          &lt;!&ndash;              <v-icon class="mr-1" small>mdi-favorite</v-icon>&ndash;&gt;-->
  <!--          &lt;!&ndash;              <span class="subheading mr-2">{{ tweet.favorite_count }}</span>&ndash;&gt;-->
  <!--          &lt;!&ndash;              <v-icon class="mr-1" small>mdi-share</v-icon>&ndash;&gt;-->
  <!--          &lt;!&ndash;              <span class="subheading">{{ tweet.retweet_count }}</span>&ndash;&gt;-->
  <!--          &lt;!&ndash;            </v-layout>&ndash;&gt;-->
  <!--        </v-list-tile>-->
  <!--        <v-btn v-if="!contextMenu" text fab icon small @click="clicked">-->
  <!--          <v-icon color="indigo">-->
  <!--            mdi-{{ tweet.selected ? 'remove-circle' : 'add-circle' }}-->
  <!--          </v-icon>-->
  <!--        </v-btn>-->
  <!--        <v-dialog v-model="dialog" max-width="600px">-->
  <!--          <template v-slot:activator="{ on }">-->
  <!--            <v-btn text fab icon small color="red" v-on="on">-->
  <!--              <v-icon>mdi-edit</v-icon>-->
  <!--            </v-btn>-->
  <!--          </template>-->
  <!--          <v-card>-->
  <!--            <v-card-title>-->
  <!--              <span class="headline">Edit Tweet Labeling</span>-->
  <!--            </v-card-title>-->
  <!--            <v-card-text>-->
  <!--              &lt;!&ndash;                error  'grid-list-md' has been removed  vuetify/no-legacy-grid&ndash;&gt;-->
  <!--              <v-container>-->
  <!--                <v-row>-->
  <!--                  &lt;!&ndash;  eslint-disable-next-line vue/no-v-html&ndash;&gt;-->
  <!--                  <v-col cols="12" v-html="decoratedText"></v-col>-->
  <!--                  <v-col cols="6">-->
  <!--                    <v-combobox-->
  <!--                      v-model="customGroup"-->
  <!--                      :items="groups"-->
  <!--                      chips-->
  <!--                      label="User Category"-->
  <!--                      clearable-->
  <!--                    >-->
  <!--                      <template v-slot:selection="data">-->
  <!--                        <v-chip-->
  <!--                          :key="JSON.stringify(data.item)"-->
  <!--                          :selected="data.selected"-->
  <!--                          class="v-chip&#45;&#45;select-multi"-->
  <!--                          @click.stop="data.parent.selectedIndex = data.index"-->
  <!--                          @input="data.parent.selectItem(data.item)"-->
  <!--                        >-->
  <!--                          <v-avatar class="accent white&#45;&#45;text">-->
  <!--                            <v-icon>mdi-account-circle</v-icon>-->
  <!--                          </v-avatar>-->
  <!--                          {{ data.item }}-->
  <!--                        </v-chip>-->
  <!--                      </template>-->
  <!--                    </v-combobox>-->
  <!--                  </v-col>-->
  <!--                  <v-col cols="6">-->
  <!--                    <v-combobox-->
  <!--                      v-model="customTheme"-->
  <!--                      :items="themes"-->
  <!--                      chips-->
  <!--                      label="Content Theme"-->
  <!--                      clearable-->
  <!--                    >-->
  <!--                      <template v-slot:selection="data">-->
  <!--                        <v-chip-->
  <!--                          :key="JSON.stringify(data.item)"-->
  <!--                          :selected="data.selected"-->
  <!--                          class="v-chip&#45;&#45;select-multi"-->
  <!--                          @click.stop="data.parent.selectedIndex = data.index"-->
  <!--                          @input="data.parent.selectItem(data.item)"-->
  <!--                        >-->
  <!--                          <v-avatar class="accent white&#45;&#45;text">-->
  <!--                            <v-icon>mdi-tag</v-icon>-->
  <!--                          </v-avatar>-->
  <!--                          {{ data.item }}-->
  <!--                        </v-chip>-->
  <!--                      </template>-->
  <!--                    </v-combobox>-->
  <!--                  </v-col>-->
  <!--                </v-row>-->
  <!--              </v-container>-->
  <!--            </v-card-text>-->
  <!--            <v-card-actions>-->
  <!--              <v-spacer></v-spacer>-->
  <!--              <v-btn color="blue darken-1" text @click="closeDialog(false)">-->
  <!--                Close-->
  <!--              </v-btn>-->
  <!--              <v-btn color="blue darken-1" text @click="closeDialog(true)">-->
  <!--                Save-->
  <!--              </v-btn>-->
  <!--            </v-card-actions>-->
  <!--          </v-card>-->
  <!--        </v-dialog>-->
  <!--        <v-btn text fab icon small @click="expand = !expand">-->
  <!--          <v-icon>mdi-{{ expand ? 'menu' : 'menu-open' }}</v-icon>-->
  <!--        </v-btn>-->
  <!--      </v-card-actions>-->
  <!--      <v-card-text>-->
  <!--        <v-row>-->
  <!--          <v-col v-show="expand" cols="12" class="transition-ease-in-out">-->
  <!--            <v-tabs v-model="active" centered grow slider-color="grey">-->
  <!--              <v-tab ripple>-->
  <!--                <v-icon>mdi-emoji-emotions</v-icon>-->
  <!--              </v-tab>-->
  <!--              <v-tab ripple>-->
  <!--                <v-icon>mdi-speaker-notes</v-icon>-->
  <!--              </v-tab>-->
  <!--              <v-tab-item>-->
  <!--                <div-->
  <!--                  v-for="label in sortedAnalysis"-->
  <!--                  :key="label.id"-->
  <!--                  class="text-center"-->
  <!--                >-->
  <!--                  <span>{{ label.id }}: </span>-->
  <!--                  <v-chip-->
  <!--                    :color="label.result > 0 ? 'green' : 'orange'"-->
  <!--                    outlined-->
  <!--                  >-->
  <!--                    <v-avatar style="margin-right: 0px;">-->
  <!--                      <v-icon>-->
  <!--                        mdi-{{ label.result > 0 ? 'mood' : 'mood-bad' }}-->
  <!--                      </v-icon>-->
  <!--                    </v-avatar>-->
  <!--                    <strong>{{ (+label.result).toPrecision(2) }}</strong>-->
  <!--                  </v-chip>-->
  <!--                  <v-divider></v-divider>-->
  <!--                </div>-->
  <!--              </v-tab-item>-->
  <!--              <v-tab-item>-->
  <!--                <div-->
  <!--                  v-for="label in sortedLabels"-->
  <!--                  :key="label.id"-->
  <!--                  class="text-center"-->
  <!--                >-->
  <!--                  <span>{{ label.id }}: </span> <br />-->
  <!--                  <v-chip :color="colorScale(label.result.group)" outlined>-->
  <!--                    <v-avatar style="margin-right: 0px;">-->
  <!--                      <v-icon>mdi-account-circle</v-icon>-->
  <!--                    </v-avatar>-->
  <!--                    <strong>{{ label.result.group }}</strong>-->
  <!--                  </v-chip>-->
  <!--                  <v-chip :color="colorScale(label.result.theme)" outlined>-->
  <!--                    <v-avatar style="margin-right: 0px;">-->
  <!--                      <v-icon>mdi-label</v-icon>-->
  <!--                    </v-avatar>-->
  <!--                    <strong>{{ label.result.theme }}</strong>-->
  <!--                  </v-chip>-->
  <!--                  <v-divider></v-divider>-->
  <!--                </div>-->
  <!--              </v-tab-item>-->
  <!--            </v-tabs>-->
  <!--          </v-col>-->
  <!--          <v-col cols="12">-->
  <!--              <span v-if="tweet.possibly_sensitive" class="red&#45;&#45;text caption">-->
  <!--                Possibly Sensitive-->
  <!--              </span>-->
  <!--            &lt;!&ndash;  eslint-disable-next-line vue/no-v-html&ndash;&gt;-->
  <!--            <div class="body-2" v-html="decoratedText"></div>-->
  <!--            &lt;!&ndash;              <span&ndash;&gt;-->
  <!--            &lt;!&ndash;                v-if="tweet.labels.find(a => a.id === 'custom')"&ndash;&gt;-->
  <!--            &lt;!&ndash;                class="red&#45;&#45;text"&ndash;&gt;-->
  <!--            &lt;!&ndash;              >&ndash;&gt;-->
  <!--            &lt;!&ndash;                {{ tweet.labels.find(a => a.id === 'custom') }}&ndash;&gt;-->
  <!--            &lt;!&ndash;              </span>&ndash;&gt;-->
  <!--          </v-col>-->
  <!--        </v-row>-->
  <!--      </v-card-text>-->
  <!--    </v-card>-->
  <!--  </v-col>-->
</template>

<script>
import * as d3 from 'd3'
export default {
  name: 'Tweet',
  props: {
    contextMenu: {
      type: Boolean,
      default: false,
    },
    avgSentiment: {
      type: Number,
      default: 0,
    },
    influence: {
      type: Number,
      default: 0,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    tweet: {
      type: Object,
      default() {
        return {
          id: 'sample',
          text:
            'sample ldsfkgj sldfkhglsjdfhg ldskjfhg ;ahglwerhgipuweyrg phg phgwiehg iw45thg 09q4yhgeohgwelrugh ogowhg wiergh pwhg pihg pwhgpeqhg pqhgqphg phgeh ieqwhg oiwhg iwehg ',
          created_at: new Date('2019-06-18 00:26:53.000').toDateString(),
          retweet_count: 100,
          favorite_count: 100,
          possibly_sensitive: false,
          selected: false,
          user: {
            name: 'John Doe',
            screen_name: 'JohnDoe',
            verified: true,
            followers_count: 100,
            friends_count: 10,
            statuses_count: 100,
            avg_sentiment: 2.8,
            influence: 35.24,
            profile_image_url_https:
              'https://pbs.twimg.com/profile_images/942858479592554497/BbazLO9L_normal.jpg',
            profile_background_image_url_https:
              'https://abs.twimg.com/images/themes/theme4/bg.gif',
          },
          analysis: {
            id: 'folan',
            title: 'Folan',
            result: 0.88,
          },
        }
      },
    },
  },
  data() {
    return {
      dialog: false,
      tempGroup: '',
      tempTheme: '',
      expand: false,
      active: 0,
    }
  },
  computed: {
    colorScale() {
      return d3.scaleOrdinal(d3.schemeCategory10)
    },
    sortedLabels() {
      return this.tweet.labels
    },
    sortedAnalysis() {
      return this.tweet.analysis
    },
    groups() {
      return this.sortedLabels.map((a) => a.result.group)
    },
    themes() {
      return this.sortedLabels.map((a) => a.result.theme)
    },
    selectedTweetCategorizationHeaders() {
      return [
        {
          text: 'Labeling Method',
          align: 'left',
          sortable: true,
          value: 'title',
        },
        {
          text: 'User Group',
          align: 'left',
          sortable: true,
          value: 'result.group',
        },
        {
          text: 'Content Theme',
          align: 'left',
          sortable: true,
          value: 'result.theme',
        },
      ]
    },
    selectedTweetAnalysisHeaders() {
      return [
        {
          text: 'Analysis Method',
          align: 'left',
          sortable: true,
          value: 'title',
        },
        {
          text: 'Sentiment',
          align: 'left',
          sortable: true,
          value: 'result',
        },
      ]
    },
    niceDate() {
      const date = new Date(this.tweet.created_at)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const secs = diff / 1000
      const mins = diff / (1000 * 60)
      const hours = diff / (1000 * 60 * 60)
      const days = diff / (1000 * 60 * 60 * 24)
      const weeks = diff / (1000 * 60 * 60 * 24 * 7)
      if (weeks > 1) return ~~weeks + 'w'
      else if (days > 1) return ~~days + 'd'
      else if (hours > 1) return ~~hours + 'h'
      else if (mins > 1) return ~~mins + 'm'
      else return ~~secs + 's'
    },
    customGroup: {
      get() {
        const label = this.tweet.labels.find((t) => t.id === 'custom')
        let group = this.tempGroup
        if (label) group = label.result.group
        return group
      },
      set(val) {
        this.tempGroup = val
      },
    },
    customTheme: {
      get() {
        const label = this.tweet.labels.find((t) => t.id === 'custom')
        let theme = this.tempTheme
        if (label) theme = label.result.theme
        return theme
      },
      set(val) {
        this.tempTheme = val
      },
    },
    decoratedText() {
      let text = this.tweet.original_text
      for (const kw of this.tweet.keywords) {
        const regEx = new RegExp(kw, 'ig')
        text = text.replace(regEx, (matched, index, original) => {
          return '<u>' + matched + '</u>'
        })
      }
      return (
        '<p>' +
        text
          .replace(/RT/g, '<b>RT</b>')
          // Links
          .replace(
            /(https:\/\/)?(http:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g,
            (matched, index, original) => {
              return (
                '<a style="text-decoration: none;" href="' +
                matched +
                '" target="_blank">' +
                matched +
                '</a>'
              )
            }
          )
          // Mentions
          .replace(/(@[A-z])\w+/g, (matched, index, original) => {
            return (
              '<a style="text-decoration: none;" href="https://twitter.com/' +
              matched +
              '" target="_blank">' +
              matched +
              '</a>'
            )
          })
          // Hashtags
          .replace(/(#[A-z])\w+/g, (matched, index, original) => {
            return (
              '<a style="text-decoration: none;" href="https://twitter.com/search?q=%23' +
              matched +
              '" target="_blank">' +
              matched +
              '</a>'
            )
          }) +
        '</p>'
      )
    },
  },
  methods: {
    clicked() {
      if (this.tweet.selected) this.$emit('deselected', this.tweet)
      else this.$emit('selected', this.tweet)
    },
    closeDialog(save) {
      if (save)
        this.$emit('customLabelTweet', {
          tweet: this.tweet,
          group: this.tempGroup,
          theme: this.tempTheme,
        })
      this.dialog = false
    },
  },
}
</script>

<style scoped>
.boxed {
  border-style: solid;
  border-width: thin;
  border-color: #cecece;
}
.text-truncate {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
