<template>
  <div :id="'tweet-' + idStr + '-target'">
    <tweet :id="idStr" ref="tweet" :options="options"></tweet>
    <!--    <tweet id="1050118621198921728"></tweet>-->
  </div>
</template>

<script>
import { Tweet } from 'vue-tweet-embed'
export default {
  name: 'TestTweet',
  components: {
    Tweet,
  },
  props: {
    idStr: {
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
      document.getElementById('tweet-' + this.idStr + '-target').innerHTML = ''
      window.twttr.widgets.createTweetEmbed(
        this.idStr,
        document.getElementById('tweet-' + this.idStr + '-target')
      )
    }
  },
}
</script>

<style scoped></style>
