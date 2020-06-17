<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-card outlined>
    <v-card-title v-if="showMeta">
      {{ label }}
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <div :id="divId">
        <scatter-plot
          :chart-dom-i-d="id"
          :width="width"
          :height="height"
          :line="line"
          :axes-meta="axesMeta"
          :radius="radius"
          :color-range="colorRange"
          :transform="transform"
          :scale-to-content="false"
          :dataset="scatterplotData"
          :selected-data="selectedData"
          @zoomed="zoomed"
          @circleClicked="circleClicked"
        />
      </div>
    </v-card-text>
    <!--    <v-card-actions>-->
    <!--      <v-btn icon small @click="meta.show = !meta.show">-->
    <!--        <v-icon>-->
    <!--          mdi-{{ meta.show ? 'help-circle' : 'help-circle-outline' }}-->
    <!--        </v-icon>-->
    <!--      </v-btn>-->
    <!--    </v-card-actions>-->
    <!--    <v-slide-y-transition>-->
    <!--      <v-card-actions v-show="meta.show">-->
    <!--        <v-btn icon small @click="reset">-->
    <!--          <v-icon>mdi-refresh</v-icon>-->
    <!--        </v-btn>-->

    <!--        <v-spacer></v-spacer>-->

    <!--        <span class="caption theme&#45;&#45;light">Old:</span>-->
    <!--        <input v-model="colorRange[0]" type="color" />-->

    <!--        <v-spacer></v-spacer>-->

    <!--        <span class="caption theme&#45;&#45;light">Recent:</span>-->
    <!--        <input v-model="colorRange[1]" type="color" />-->

    <!--        <v-spacer></v-spacer>-->

    <!--        <v-slider-->
    <!--          v-model="radius"-->
    <!--          hint="Circle size"-->
    <!--          persistent-hint-->
    <!--          thumb-label="always"-->
    <!--          min="1"-->
    <!--          max="20"-->
    <!--          prepend-icon="mdi-minus-circle"-->
    <!--          append-icon="mdi-plus-circle"-->
    <!--          @click:prepend="decrement"-->
    <!--          @click:append="increment"-->
    <!--        >-->
    <!--        </v-slider>-->
    <!--      </v-card-actions>-->
    <!--    </v-slide-y-transition>-->
  </v-card>
</template>

<script>
import * as d3 from 'd3'
import ScatterPlot from './ScatterPlot'
export default {
  name: 'ScatterPlotWrapper',
  components: {
    'scatter-plot': ScatterPlot,
  },
  props: {
    id: {
      type: String,
      default: 'scatterplot',
    },
    divId: {
      type: String,
      default: 'scatterplot-div',
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
    flat: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: 'This Amazing Scatter Plot',
    },
    selectedData: {
      type: Object,
      default() {
        return {}
      },
    },
    dataset: {
      type: Array,
      default() {
        return []
      },
    },
    siftDataset: {
      type: Boolean,
      default: true,
    },
    selectedAnalysisMethod: {
      type: String,
      default: '',
    },
    showMeta: {
      type: Boolean,
      default: false,
    },
    axesMeta: {
      type: Object,
      default() {
        return {
          x: {
            selector: 'x',
            initialBound: [-1, 200],
            scaleToContent: false,
            zoomEnabled: true,
            label: 'User Influence',
          },
          y: {
            selector: 'y',
            initialBound: [-1, 1],
            scaleToContent: false,
            zoomEnabled: false,
            label: 'Average Sentiment',
          },
        }
      },
    },
    line: {
      type: Object,
      default() {
        return {
          show: false,
          fill: 'none',
          stroke: 'grey',
          stroke_width: '1.0',
        }
      },
    },
  },
  data() {
    return {
      radius: 25,
      transform: d3.zoomIdentity,
      colorRange: ['#d4e3f4', '#14004f'],
      meta: {
        show: false,
        info: 'Hello this is only a help box!',
      },
    }
  },
  computed: {
    scatterplotData() {
      const res = []
      if (this.siftDataset) {
        // Sift the dataset by the selected analysis method
        if (this.selectedAnalysisMethod === '') return res
        const bucket = this.dataset.filter(
          (cat) => cat._id === this.selectedAnalysisMethod
        )[0]

        // Construct the individual items to be represented
        for (const item of bucket.items) {
          if (!item.user) continue
          res.push({
            // influence
            x:
              item.user.followers_count ||
              0 / ((item.user.friends_count || 0) + 1),

            // sentiment
            y: item.avg_sentiment,
            // id
            id_str: item.user.id_str,
            // meta data
            tweets: item.tweets,
            user: item.user,
          })
        }
      } else {
        for (const tweet of this.dataset) {
          // Calculate avg. sentiment for each tweet
          let avgSentiment = 0
          for (const sent of tweet.analysis) avgSentiment += sent.result
          avgSentiment = avgSentiment / tweet.analysis.length

          // Add the item
          res.push({
            ...tweet,
            x: new Date(tweet.date),
            y: avgSentiment,
          })
        }
      }
      // Sort by x value
      return res.sort((a, b) => {
        return a.x > b.x ? 1 : -1
      })
    },
  },
  methods: {
    zoomed(transform) {
      this.transform = transform
    },
    increment() {
      this.radius += 1
    },
    decrement() {
      this.radius -= 1
    },
    circleClicked(data) {
      this.$emit('circleClicked', data)
    },
    reset() {
      this.transform = d3.zoomIdentity
      this.colorRange = ['#d4e3f4', '#14004f']
      this.radius = 4
    },
  },
}
</script>

<style scoped></style>
