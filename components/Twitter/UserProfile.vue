<template>
  <v-card outlined>
    <v-card-title> User Profile </v-card-title>
    <v-divider></v-divider>
    <v-card-text id="timeline-target" style="max-height: 638px; overflow: auto">
      <v-skeleton-loader
        v-if="username === '' || username === null"
        type="card-heading, divider, list-item-avatar-three-line, divider,
          list-item-avatar-three-line, divider, list-item-avatar-three-line, divider,
          list-item-avatar-three-line, divider, list-item-avatar-three-line, divider,
          list-item-avatar-three-line, divider"
        width="100%"
      >
      </v-skeleton-loader>
      <time-line
        v-if="username"
        :id="username"
        ref="timeline"
        source-type="profile"
        :options="options"
      ></time-line>
    </v-card-text>
  </v-card>
</template>

<script>
import { Timeline } from 'vue-tweet-embed'
export default {
  name: 'UserProfile',
  components: {
    'time-line': Timeline,
  },
  props: {
    username: {
      type: String,
      default: '',
    },
    options: {
      type: Object,
      default() {
        return {
          tweetLimit: '10',
          chrome: 'transparent',
          dnt: 'true',
        }
      },
    },
  },
  updated() {
    if (window.twttr) {
      document.getElementById('timeline-target').innerHTML = ''
      window.twttr.widgets.createTimeline(
        {
          sourceType: 'profile',
          screenName: this.username,
        },
        document.getElementById('timeline-target'),
        this.options
      )
    }
  },
}
</script>

<style scoped></style>
