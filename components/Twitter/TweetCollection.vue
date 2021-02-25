<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-col md="6" lg="4" cols="12">
    <v-card :id="'tweetcollection-' + title" outlined min-width="300">
      <v-card-actions>
        <v-row align="center" justify="center">
          <h2 class="font-weight-thin" style="text-transform: uppercase">
            {{ title }}
          </h2>
        </v-row>
      </v-card-actions>
      <v-divider></v-divider>
      <v-card-text
        :id="'tweetcontainer-' + title"
        :style="'overflow: auto; height: ' + verticalPortion + 'vh;'"
      >
        <tweet
          v-for="(tweet, index) in tweets"
          :id="'tweet-' + tweet.id_str"
          :key="index"
          :tweet="tweet"
          :selected="tweet.selected"
          @selected="addTweet"
          @deselected="removeTweet"
          @customLabelTweet="updateTweet"
        ></tweet>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-row justify="space-around" align="center">
          <v-skeleton-loader
            v-if="selectedTweets.length === 0"
            type="avatar"
            boilerplate
          >
          </v-skeleton-loader>
          <v-skeleton-loader
            v-if="selectedTweets.length === 0"
            type="avatar"
            boilerplate
          >
          </v-skeleton-loader>
          <v-badge
            v-for="(tweet, index) in selectedTweets"
            :key="index"
            overlap
            color="orange"
          >
            <template #badge>
              <v-icon x-small dark @click="removeTweet.call(this, tweet)">
                mdi-close
              </v-icon>
            </template>
            <v-avatar elevation @click="clicked.call({}, tweet)">
              <img
                :src="tweet.user.profile_image_url_https"
                :alt="tweet.user.screen_name"
              />
            </v-avatar>
          </v-badge>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
import Tweet from './Tweet'
export default {
  name: 'TweetCollection',
  components: {
    tweet: Tweet,
  },
  props: {
    title: {
      type: String,
      default: 'Title',
    },
    verticalPortion: {
      type: Number,
      default: 60,
    },
    tweets: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {}
  },
  computed: {
    selectedTweets() {
      return this.tweets.filter((t) => t.selected)
    },
    sortedTweets() {
      const temp = this.tweets
      return temp.sort((a, b) => {
        return a.date < b.date ? 1 : -1
      })
    },
    target() {
      return (tweet) => {
        return '#' + 'tweet-' + tweet.id_str
      }
    },
    options() {
      return (topic) => {
        return {
          duration: 300,
          offset: 60,
          easing: 'easeInOutCubic',
          container: '#' + 'tweetcontainer-' + topic,
        }
      }
    },
  },
  mounted() {},
  methods: {
    addTweet(tweet) {
      tweet.selected = true
      tweet.hover = false
      tweet.exam = false
      if (!this.selectedTweets.map((a) => a.id_str).includes(tweet.id_str)) {
        if (this.selectedTweets.length < 4) {
          this.selectedTweets.push(tweet)
          this.$emit('tweetSelect', tweet)
        }
      }
    },
    removeTweet(tweet) {
      tweet.selected = false
      const index = this.selectedTweets.findIndex(
        (a) => a.id_str === tweet.id_str
      )
      this.selectedTweets.splice(index, 1)
      this.$emit('tweetDeselect', tweet)
    },
    updateTweet(data) {
      this.$emit('updateTweet', data)
    },
    clicked(tweet) {
      this.$vuetify.goTo(this.target(tweet), this.options(this.title))
    },
  },
}
</script>
