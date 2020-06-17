<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-row align="start" justify="start" no-gutters>
    <v-col :lg="minimizeTopics ? '2' : '3'" :cols="minimizeTopics ? '4' : '5'">
      <v-card outlined>
        <v-card-title>
          <span class="title">Topics</span>
          <v-spacer></v-spacer>
          <v-btn icon text @click="minimizeTopics = !minimizeTopics">
            <v-icon>
              mdi-chevron-double-{{ minimizeTopics ? 'right' : 'left' }}
            </v-icon>
          </v-btn>
          <v-btn text icon color="warning" @click="topicsTreeSelections = []">
            <v-icon>mdi-replay</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text
          class="text-truncate"
          :style="
            'overflow: auto !important; max-height: ' + verticalPortion + 'vh;'
          "
        >
          <v-treeview
            v-model="topicsTreeSelections"
            class="text-truncate"
            :items="topicItems"
            :open="treeViewOpenItems"
            color="indigo"
            dense
            activatable
            transition
            hoverable
            multiple-active
            open-on-click
            selectable
          >
          </v-treeview>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col :lg="minimizeTopics ? '10' : '9'" :cols="minimizeTopics ? '8' : '7'">
      <v-row class="fill-height" justify="center">
        <v-col cols="12">
          <v-row
            id="topics-columns"
            align="start"
            justify="start"
            class="smooth-scroll flex-nowrap"
            style="height: 100%; max-height: 100%;"
            dense
            no-gutters
          >
            <v-skeleton-loader
              v-if="selectedChannels.length === 0"
              type="card-heading, divider, list-item-avatar-three-line, actions, divider, list-item-avatar-three-line, actions, divider, table-tfoot"
              width="33%"
            >
            </v-skeleton-loader>
            <v-skeleton-loader
              v-if="selectedChannels.length === 0"
              type="card-heading, divider, list-item-avatar-three-line, actions, divider, list-item-avatar-three-line, actions, divider, table-tfoot"
              width="33%"
            >
            </v-skeleton-loader>
            <v-skeleton-loader
              v-if="selectedChannels.length === 0"
              type="card-heading, divider, list-item-avatar-three-line, actions, divider, list-item-avatar-three-line, actions, divider, table-tfoot"
              width="33%"
            >
            </v-skeleton-loader>
            <tweet-collection
              v-for="(channel, index) in selectedChannels"
              :id="'column-' + channel"
              :key="'channel-' + index + '-' + channel"
              :tweets="
                filteredTweets.filter((a) =>
                  Object.keys(a.topics).includes(channel)
                )
              "
              :title="channel"
              :vertical-portion="verticalPortion - 9"
              @tweetSelect="tweetSelect"
              @tweetDeselect="tweetDeselect"
              @updateTweet="updateTweet"
            ></tweet-collection>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
    <v-col :cols="12">
      <v-btn
        block
        text
        @click="
          $vuetify.goTo('#' + charts.contextMap.divId, {
            duration: 300,
            offset: 60,
            easing: 'easeInOutCubic',
          })
        "
      >
        <v-icon>mdi-chevron-double-down</v-icon>
      </v-btn>
    </v-col>
    <v-col :id="charts.contextMap.divId" cols="12" class="grow text-center">
      <context-map-wrapper
        :id="charts.contextMap.id"
        :div-id="charts.contextMap.divId"
        :label="charts.contextMap.label"
        :width="charts.contextMap.width"
        :height="charts.contextMap.height"
        :topics="topics.map((a) => a.id).sort()"
        :tweets="selectedTweets"
        :exam-menu="examMenu"
        @topicSelected="topicSelected"
        @tweetClicked="toggleTweetExamMenu"
        @toggleTweetExamMenu="toggleTweetExamMenu"
      ></context-map-wrapper>
    </v-col>
  </v-row>
</template>

<script>
import socket from '../lib/socket.io'
import TweetCollection from '../components/Twitter/TweetCollection'
import ContextMapWrapper from '../components/ContextMap/ContextMapWrapper'
export default {
  name: 'PageShuffler',
  // layout: 'shuffler',
  components: {
    TweetCollection,
    'context-map-wrapper': ContextMapWrapper,
  },
  data() {
    return {
      verticalPortion: 70,
      dialog: false,
      contentThemeTreeSelections: [],
      userGroupsTreeSelections: [],
      selectedTweets: [],
      examMenu: [],
      charts: {
        contextMap: {
          id: 'scatter-plot',
          divId: 'scatter-plot-div',
          label: 'Context Map',
          width: 700,
          height: 300,
          line: {
            show: true,
            fill: 'none',
            stroke: 'grey',
            stroke_width: '1.0',
          },
          axesMeta: {
            x: {
              selector: 'x',
              // Starting from 24 hours earlier 5 minues from now
              initialBound: [
                Date.now() - 24 * 60 * 60 * 1000,
                Date.now() + 1 * 5 * 60 * 1000,
              ],
              scaleToContent: false,
              zoomEnabled: true,
              label: 'Time',
              isTime: true,
              show: false,
            },
            y: {
              selector: 'y',
              initialBound: [-1, 1],
              scaleToContent: false,
              zoomEnabled: false,
              label: 'Average Sentiment',
              show: false,
            },
          },
        },
      },
    }
  },
  computed: {
    target() {
      return (channel) => {
        const id = 'column-' + channel
        if (document.getElementById(id)) return '#' + id
        else return '#topics-columns'
      }
    },
    options() {
      return {
        duration: 300,
        offset: 60,
        easing: 'easeInOutCubic',
        container: '#topics-columns',
      }
    },
    minimizeTopics: {
      set(val) {
        this.$store.commit('shuffler/updateMinimizeTopics', val)
      },
      get() {
        return this.$store.state.shuffler.minimizeTopics
      },
    },
    treeViewOpenItems: {
      set(val) {
        this.$store.commit('shuffler/updateTreeViewOpenItems', val)
      },
      get() {
        return this.$store.state.shuffler.treeViewOpenItems
      },
    },
    topicsTreeSelections: {
      set(val) {
        this.$store.commit('shuffler/updateTopicsTreeSelections', val)
      },
      get() {
        return this.$store.state.shuffler.topicsTreeSelections
      },
    },
    filteredTweets() {
      let res = []
      for (const kw of this.topicsTreeSelections) {
        const tweets = this.tweets.filter((t) => t.keywords.includes(kw))
        res = [...res, ...tweets]
      }
      // Making unique
      const temp = {}
      res.forEach((t, i) => {
        if (t._id in temp) res.splice(i, 1)
        temp[t._id] = null
      })
      return res
    },
    selectedChannels() {
      const res = []
      for (const item of this.filteredTweets.map((a) => Object.keys(a.topics)))
        for (const topic of item) if (!res.includes(topic)) res.push(topic)
      return res.sort()
    },
    userGroupItems() {
      // this.tweets().map(tw => tw.labels[i].result.group)
      return []
    },
    contentThemeItems() {
      return []
    },
    topicItems() {
      const that = this
      const children = this.topics
        .map((channel) => ({
          id: channel.id + '-channel',
          name: that.getName(channel.id),
          children: that.getChildren(channel.id),
        }))
        .sort((a, b) => {
          return a.name > b.name ? 1 : -1
        })
      return [
        {
          id: '1',
          name: 'All Topics',
          children,
        },
      ]
    },
    tweets() {
      const uniques = []
      for (const tweet of this.rawTweets) {
        if (!uniques.map((a) => a.id_str).includes(tweet.id_str))
          uniques.push(tweet)
      }
      return uniques
        .map((tw) => {
          return {
            ...tw,
            date: new Date(tw.created_at).getTime(),
            selected: false,
          }
        })
        .sort((a, b) => {
          return a.date > b.date ? 1 : -1
        })
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
    topics: {
      set(val) {
        this.$store.commit('topics', val)
      },
      get() {
        return this.$store.state.topics
      },
    },
    rawTweets: {
      set(val) {
        this.$store.commit('updateRawTweets', val)
      },
      get() {
        return this.$store.state.rawTweets
      },
    },
  },
  watch: {
    // dialog(val, prev) {
    //   this.temp_topic.channel = ''
    //   this.temp_topic.keywords = []
    // },
    // selections(val, prev) {
    // socket.emit('update_channels', val)
    // }
  },
  mounted() {
    window.addEventListener('resize', this.resize)
    this.resize()
  },
  updated() {
    this.resize()
  },
  methods: {
    resize() {
      // const sunburstDiv = document.getElementById(this.charts.sunburst.divId)
      // const scatterDiv = document.getElementById(this.charts.scatterplot.divId)
      // if (scatterDiv) this.charts.scatterplot.width = scatterDiv.clientWidth - 5
      // if (sunburstDiv) {
      //   this.charts.sunburst.width = sunburstDiv.clientWidth - 5
      //   this.charts.sunburst.height = sunburstDiv.clientWidth - 5
      // }
      const contextDiv = document.getElementById(this.charts.contextMap.divId)
      if (contextDiv) this.charts.contextMap.width = contextDiv.clientWidth - 50
    },
    getChildren(topic) {
      if (!topic || topic === '') return []
      if (!this.topics.map((a) => a.id).includes(topic)) return []
      const keywords = []
      const foundTopic = this.topics.find((a) => a.id === topic)
      if (!foundTopic) return []
      for (const keyword of foundTopic.keywords) {
        keywords.push({
          id: keyword.toLowerCase(),
          name: this.getName(keyword),
        })
      }
      return keywords.sort((a, b) => {
        return a.id > b.id ? 1 : -1
      })
    },
    // closeDialog(save) {
    //   if (save)
    //     this.$store.commit('updateSelectedTopic', {
    //       channel: this.temp_topic.channel,
    //       keywords: this.temp_topic.keywords
    //     })
    //   this.dialog = false
    // },
    getName(name) {
      return `${name.charAt(0).toUpperCase()}${name.slice(1)}`
    },
    tweetSelect(tweet) {
      if (!this.selectedTweets.map((a) => a.id_str).includes(tweet.id_str))
        this.selectedTweets.push(tweet)
    },
    tweetDeselect(tweet) {
      const index = this.selectedTweets.findIndex(
        (a) => a.id_str === tweet.id_str
      )
      this.selectedTweets.splice(index, 1)
    },
    updateTweet(data) {
      socket.emit('update_labeling', data)
      // eslint-disable-next-line no-console
      const tweet = data.tweet
      const label = tweet.labels.find((a) => a.id === 'custom')
      if (label) {
        label.result.group = data.group
        label.result.theme = data.theme
      } else
        tweet.labels.push({
          id: 'custom',
          result: {
            group: data.group,
            theme: data.theme,
          },
        })
    },
    topicSelected(data) {
      // eslint-disable-next-line no-console
      const container = document.getElementById('column-' + data)
      if (container)
        container.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'start',
        })
    },
    toggleTweetExamMenu(tweet) {
      if (!this.examMenu.map((a) => a.id_str).includes(tweet.id_str)) {
        if (this.examMenu.length < 4) {
          tweet.exam = true
          this.examMenu.push(tweet)
        }
      } else {
        const index = this.examMenu.findIndex((a) => a.id_str === tweet.id_str)
        this.examMenu.splice(index, 1)
        tweet.exam = false
      }
    },
  },
}
</script>

<style scoped>
.smooth-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
}
</style>
