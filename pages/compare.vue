<template>
  <v-row dense no-gutters>
    <v-col cols="12" class="mt-5 text-center">
      <v-slider
        v-model="comparisonSlider"
        :tick-labels="[1, 2, 3, 4, 6, 12]"
        :max="6"
        :min="1"
        step="1"
        ticks="always"
        tick-size="1"
        @change="updateComparisons"
      ></v-slider>
    </v-col>
    <v-col
      v-for="(comparison, index) in comparisons"
      :key="index"
      :cols="12 / comparisons.length"
    >
      <v-card outlined flat>
        <v-card-text>
          <v-row align="center" justify="center">
            <v-col v-if="mlMethods.length === 0" cols="6">
              <v-skeleton-loader
                type="card-heading, divider, list-item-three-line"
              >
              </v-skeleton-loader>
            </v-col>
            <v-col v-if="mlMethods.length === 0" cols="6">
              <v-skeleton-loader
                type="card-heading, divider, list-item-three-line"
              >
              </v-skeleton-loader>
            </v-col>
            <v-col v-if="mlMethods.length !== 0" cols="6" class="text-center">
              <h4>Text Categorization Methods</h4>
              <v-select
                :value="comparison.machineLearning"
                class="no-overflow"
                :items="mlMethods"
                item-text="title"
                item-value="id"
                label="Text Categorization Method"
                @change="commitMLChange.call(this, arguments[0], index)"
              ></v-select>
            </v-col>
            <v-col
              v-if="analysisMethods.length !== 0"
              cols="6"
              class="text-center"
            >
              <h4>Sentiment Analysis Methods</h4>
              <v-select
                :value="comparison.analysis"
                class="no-overflow"
                :items="analysisMethods"
                item-text="title"
                item-value="id"
                label="Sentiment Analysis Methods"
                @change="
                  commitAnalysisMethodChange.call(this, arguments[0], index)
                "
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-text>
          <sankey-diagram-wrapper
            :id="charts.sankey.id + '-comparison-' + index"
            :ref="'comparison-' + index"
            :div-id="charts.sankey.divId + '-comparison-' + index"
            :label="index + 1 + ' - ' + charts.sankey.label"
            :width="charts.sankey.width"
            :height="charts.sankey.height"
            :color="color"
            :outlined="outlined"
            :flat="flat"
            :topics="topics"
            :selected-ml-method="comparison.machineLearning"
            :dataset="aggregatedTopics"
            @itemClick="updateSelectedTopic"
            @itemMouseover="applyHighlight"
            @itemMouseout="removeHighlight"
          ></sankey-diagram-wrapper>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-text>
          <heat-map-wrapper
            :id="charts.heatmap.id + '-comparison-' + index"
            :div-id="charts.heatmap.divId + '-comparison-' + index"
            :label="index + 1 + ' - ' + charts.heatmap.label"
            :width="charts.heatmap.width"
            :height="charts.heatmap.height"
            :selected-analysis-method="comparison.analysis"
            :selected-machine-learning-method="comparison.machineLearning"
            :selected-topic="comparison.topic"
            :color="color"
            :outlined="outlined"
            :flat="flat"
            :dataset="aggregatedKeywords"
          ></heat-map-wrapper>
        </v-card-text>
      </v-card>
    </v-col>
    <v-dialog v-model="tooSmall" max-width="290">
      <v-card>
        <v-card-title class="text-h5"> Too Small! </v-card-title>
        <v-card-text>
          The screen is too small for this page. You can still continue and use
          this app, but it would be much more enjoyable on a larger screen.
          Quick solution: try using your device in the landscape mode.
        </v-card-text>
        <v-card-actions>
          <v-btn color="grey darken-1" block text @click="tooSmall = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import ScatterPlotWrapper from '../components/Scatterplot/ScatterPlotWrapper'
import HeatMapWrapper from '../components/Heatmap/HeatMapWrapper'
import SankeyDiagramWrapper from '../components/Sankey/SankeyDiagramWrapper'

export default {
  name: 'PageCompare',
  components: {
    'sankey-diagram-wrapper': SankeyDiagramWrapper,
    // eslint-disable-next-line vue/no-unused-components
    'scatter-plot-wrapper': ScatterPlotWrapper,
    'heat-map-wrapper': HeatMapWrapper,
  },
  data() {
    return {
      outlined: false,
      tooSmall: false,
      flat: true,
      selectedTopic: '',
      color: 'transparent',
      msg: '',
      temp: [],
      // Charts and all of their configurations
      charts: {
        scatterplot: {
          id: 'scatter-plot',
          divId: 'scatter-plot-div',
          label: 'User Influence Vs. Average Sentiment',
          width: 600,
          height: 300,
        },
        sankey: {
          id: 'sankey-diagram',
          divId: 'sankey-diagram-div',
          label: 'User Categories, Topics, and Content Themes',
          width: 600,
          height: 400,
        },
        heatmap: {
          id: 'heatmap',
          divId: 'heatmap-div',
          label: 'Hybrid Analysis',
          width: 600,
          height: 400,
        },
        tweets: {
          user: {},
          tweets: [],
          avgSentiment: 0,
          influence: 0,
        },
      },
      // Data required for connection metrics
      pingPong: {
        start: 0,
        end: 0,
        busy: false,
        history: [],
      },
    }
  },
  computed: {
    /*
     * dataset containing the tweets
     */
    aggregatedTopics() {
      return this.$store.state.aggregatedTopics
    },
    aggregatedUsers() {
      return this.$store.state.aggregatedUsers
    },
    aggregatedKeywords() {
      return this.$store.state.aggregatedKeywords
    },
    topics() {
      return this.$store.state.topics
    },
    comparisonSlider: {
      set(val) {
        this.$store.commit('compare/setComparisonSlider', val)
      },
      get() {
        return this.$store.state.compare.comparisonSlider
      },
    },
    comparisons: {
      set(val) {
        this.$store.commit('compare/setComparisons', val)
      },
      get() {
        return this.$store.state.compare.comparisons
      },
    },
    analysisMethods() {
      return this.aggregatedUsers.map((cat) => {
        return {
          id: cat._id,
          title: cat.items[0].analysis.title,
        }
      })
    },
    mlMethods() {
      return this.aggregatedTopics.group_topics.map((cat) => {
        return {
          id: cat._id,
          title: cat.items[0].labels.title,
        }
      })
    },
    /*
     * Current delay in ms
     */
    delay() {
      if (this.pingPong.busy)
        if (this.pingPong.history.length > 0)
          return this.pingPong.history[this.pingPong.history.length - 1]
        else return 0
      return this.pingPong.end - this.pingPong.start
    },
    /*
     * Current average delay in ms
     */
    avgDelay() {
      let avg = 0
      for (const num of this.pingPong.history) avg += num
      avg = (10 * avg) / (this.pingPong.history.length * 10)
      return avg
    },
  },
  mounted() {
    window.addEventListener('resize', this.resize)
    this.resize()
    this.tooSmall = window.innerWidth < 960
  },
  updated() {
    this.resize()
  },
  methods: {
    resize() {
      for (const index in this.comparisons) {
        const scatterDiv = document.getElementById(
          this.charts.scatterplot.divId + '-comparison-' + index
        )
        const heatDiv = document.getElementById(
          this.charts.heatmap.divId + '-comparison-' + index
        )
        const sankeyDiv = document.getElementById(
          this.charts.sankey.divId + '-comparison-' + index
        )
        if (scatterDiv)
          this.charts.scatterplot.width = scatterDiv.clientWidth - 5
        if (heatDiv) this.charts.heatmap.width = heatDiv.clientWidth - 5
        if (sankeyDiv) this.charts.sankey.width = sankeyDiv.clientWidth - 5
      }
    },
    commitMLChange(MLid, index) {
      this.$store.commit('compare/updateComparisonML', {
        index,
        value: MLid,
      })
    },
    commitAnalysisMethodChange(MLid, index) {
      this.$store.commit('compare/updateComparisonAnalysis', {
        index,
        value: MLid,
      })
    },
    updateTweets(data) {
      this.charts.tweets.user = data.user
      this.charts.tweets.tweets = data.tweets
      this.charts.tweets.avgSentiment = data.y
      this.charts.tweets.influence = data.x
    },
    updateComparisons(count) {
      this.$store.commit('compare/updateComparisons', count)
    },
    highlightTopic(id) {
      if (this.topics.map((a) => a.id).includes(id)) {
        for (const i in this.comparisons) {
          this.$store.commit('compare/updateComparisonTopic', {
            index: i,
            value: id,
          })
        }
      }
    },
    updateSelectedTopic(item) {
      if (this.topics.map((a) => a.id).includes(item.id)) {
        this.selectedTopic = item.id
        this.highlightTopic(item.id)
      }
    },
    applyHighlight(item) {
      for (const index of Object.keys(this.$refs)) {
        const comps = this.$refs[index]
        for (const comp of comps) comp.applyHighlight(item)
      }
      this.highlightTopic(item.id)
    },
    removeHighlight(item) {
      for (const index of Object.keys(this.$refs)) {
        const comps = this.$refs[index]
        for (const comp of comps) comp.removeHighlight(item)
      }
      this.highlightTopic(this.selectedTopic)
    },
  },
}
</script>

<style scoped>
.no-overflow {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
