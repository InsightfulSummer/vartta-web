<template>
  <v-card outlined>
    <v-card-title>
      <h4>{{ label }}</h4>
    </v-card-title>
    <v-card-text>
      <div :id="divId">
        <v-skeleton-loader
          v-if="topics.length === 0"
          type="divider"
          width="100%"
        >
        </v-skeleton-loader>
        <context-map
          v-if="topics.length !== 0"
          :chart-dom-i-d="id"
          :width="width"
          :height="height"
          :color-range="colorRange"
          :topics="topics"
          :dataset="contextMapData"
          @topicSelected="topicSelected"
          @tweetClicked="tweetClicked"
        />
      </div>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-text>
      <v-row>
        <v-skeleton-loader
          v-if="examMenu.length === 0"
          type="list-item-avatar-three-line"
          width="25%"
        >
        </v-skeleton-loader>
        <v-skeleton-loader
          v-if="examMenu.length === 0"
          type="list-item-avatar-three-line"
          width="25%"
        >
        </v-skeleton-loader>
        <v-skeleton-loader
          v-if="examMenu.length === 0"
          type="list-item-avatar-three-line"
          width="25%"
        >
        </v-skeleton-loader>
        <v-skeleton-loader
          v-if="examMenu.length === 0"
          type="list-item-avatar-three-line"
          width="25%"
        >
        </v-skeleton-loader>
        <v-col
          v-for="(tweet, index) in examMenu"
          :key="'examMenu-' + index"
          cols="3"
        >
          <tweet
            :tweet="tweet"
            :selected="tweet.selected"
            :context-menu="true"
            @deselected="toggleTweetExamMenu"
          ></tweet>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import ContextMap from './ContextMap'
import Tweet from '~/components/Twitter/Tweet'
export default {
  name: 'ContextMapWrapper',
  components: {
    'context-map': ContextMap,
    tweet: Tweet,
  },
  props: {
    id: {
      type: String,
      default: 'heatmap',
    },
    divId: {
      type: String,
      default: 'heatmap-div',
    },
    height: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: 'transparent',
    },
    label: {
      type: String,
      default: 'This Amazing Scatter Plot',
    },
    tweets: {
      type: Array,
      default() {
        return []
      },
    },
    examMenu: {
      type: Array,
      default() {
        return []
      },
    },
    topics: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      colorRange: ['#d7ffdb', '#006c03'],
      meta: {
        show: false,
        info: 'Hello this is only a help box!',
      },
    }
  },
  computed: {
    contextMapData() {
      return this.tweets
    },
  },
  methods: {
    topicSelected(data) {
      this.$emit('topicSelected', data)
    },
    tweetClicked(data) {
      this.$emit('tweetClicked', data)
    },
    toggleTweetExamMenu(tweet) {
      this.$emit('toggleTweetExamMenu', tweet)
    },
  },
}
</script>

<style scoped></style>
