<template>
  <v-row dense no-gutters>
    <v-col cols="12">
      <v-card flat color="transparent">
        <v-card-actions>
          <v-row align="center" justify="space-around">
            <v-col v-if="mlMethods.length === 0" cols="12" md="7">
              <v-skeleton-loader
                v-if="mlMethods.length === 0"
                type="card-heading, divider, list-item-three-line"
              >
              </v-skeleton-loader>
            </v-col>
            <v-col v-if="mlMethods.length !== 0" md="7">
              <h4>Text Categorization Methods</h4>
              <v-select
                v-model="selectedMachineLearningMethod"
                class="no-overflow"
                :items="mlMethods"
                item-text="title"
                item-value="id"
                label="Text Categorization Method"
              ></v-select>
            </v-col>
            <v-col v-if="analysisMethods.length === 0" cols="12" md="5">
              <v-skeleton-loader
                v-if="analysisMethods.length === 0"
                type="card-heading, divider, list-item-three-line"
              >
              </v-skeleton-loader>
            </v-col>
            <v-col v-if="analysisMethods.length !== 0" md="5">
              <h4>Sentiment Analysis Methods</h4>
              <v-select
                v-model="selectedSentimentAnalysisMethod"
                class="no-overflow"
                :items="analysisMethods"
                item-text="title"
                item-value="id"
                label="Sentiment Analysis Methods"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col class="text-center" cols="12" md="7">
      <sankey-diagram-wrapper
        :id="charts.sankey.id"
        :div-id="charts.sankey.divId"
        :label="charts.sankey.label"
        :width="charts.sankey.width"
        :height="charts.sankey.height"
        :color="color"
        :flat="flat"
        :selected-ml-method="selectedMachineLearningMethod"
        :topics="topics"
        :dataset="aggregatedTopics"
        @itemClick="updateSelectedTopic"
        @itemMouseover="applyHighlight"
        @itemMouseout="removeHighlight"
      ></sankey-diagram-wrapper>
    </v-col>
    <v-col class="text-center" cols="12" md="5">
      <heat-map-wrapper
        :id="charts.heatmap.id"
        :div-id="charts.heatmap.divId"
        :selected-analysis-method="selectedSentimentAnalysisMethod"
        :selected-machine-learning-method="selectedMachineLearningMethod"
        :label="charts.heatmap.label"
        :width="charts.heatmap.width"
        :height="charts.heatmap.height"
        :color="color"
        :flat="flat"
        :selected-topic="highlightedTopic"
        :dataset="aggregatedKeywords"
      ></heat-map-wrapper>
    </v-col>
    <v-col class="text-center" cols="12" md="7">
      <scatter-plot-wrapper
        :id="charts.scatterplot.id"
        :div-id="charts.scatterplot.divId"
        :label="charts.scatterplot.label"
        :show-meta="true"
        :width="charts.scatterplot.width"
        :height="charts.scatterplot.height"
        :selected-analysis-method="selectedSentimentAnalysisMethod"
        :color="color"
        :flat="flat"
        :dataset="aggregatedUsers"
        @circleClicked="updateTweets"
      ></scatter-plot-wrapper>
    </v-col>
    <v-col class="text-center" cols="12" md="5">
      <!--   TODO: make it transparent   -->
      <user-profile :username="selectedUser.screen_name"></user-profile>
    </v-col>
  </v-row>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import ScatterPlotWrapper from '../components/Scatterplot/ScatterPlotWrapper'
import HeatMapWrapper from '../components/Heatmap/HeatMapWrapper'
import SankeyDiagramWrapper from '../components/Sankey/SankeyDiagramWrapper'
import UserProfile from '../components/Twitter/UserProfile'
export default {
  name: 'PageAnalytics',
  components: {
    UserProfile,
    'sankey-diagram-wrapper': SankeyDiagramWrapper,
    'scatter-plot-wrapper': ScatterPlotWrapper,
    'heat-map-wrapper': HeatMapWrapper,
  },
  data() {
    return {
      flat: true,
      color: 'transparent',
      highlightedTopic: '',
      // Charts and all of their configurations
      charts: {
        scatterplot: {
          id: 'scatter-plot',
          divId: 'scatter-plot-div',
          label: 'User Influence Vs. Average Sentiment',
          width: 600,
          height: 600,
        },
        sankey: {
          id: 'sankey-diagram',
          divId: 'sankey-diagram-div',
          label: 'User Groups, Topics, and Content Themes',
          width: 600,
          height: 600,
        },
        heatmap: {
          id: 'heatmap',
          divId: 'heatmap-div',
          label: 'Hybrid Analysis',
          width: 600,
          height: 600,
        },
      },
    }
  },
  computed: {
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
    selectedTopic: {
      set(val) {
        this.$store.commit('analytics/updateTopic', val)
      },
      get() {
        return this.$store.state.analytics.topic
      },
    },
    selectedUser: {
      set(val) {
        this.$store.commit('analytics/updateUser', val)
      },
      get() {
        return this.$store.state.analytics.user
      },
    },
    selectedSentimentAnalysisMethod: {
      set(val) {
        this.$store.commit('analytics/updateAnalysis', val)
      },
      get() {
        return this.$store.state.analytics.analysis
      },
    },
    selectedMachineLearningMethod: {
      set(val) {
        this.$store.commit('analytics/updateMachineLearning', val)
      },
      get() {
        return this.$store.state.analytics.machineLearning
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
  },
  mounted() {
    this.resize()
    window.addEventListener('resize', this.resize)
    if (this.selectedTopic !== null) this.highlightTopic(this.selectedTopic)
  },
  methods: {
    resize() {
      const scatterDiv = document.getElementById(this.charts.scatterplot.divId)
      const heatDiv = document.getElementById(this.charts.heatmap.divId)
      const sankeyDiv = document.getElementById(this.charts.sankey.divId)
      if (scatterDiv) this.charts.scatterplot.width = scatterDiv.clientWidth - 5
      if (heatDiv) this.charts.heatmap.width = heatDiv.clientWidth - 5
      if (sankeyDiv) this.charts.sankey.width = sankeyDiv.clientWidth - 5
    },
    updateTweets(data) {
      this.selectedUser = data.user
    },
    // Just to be consistent with the page compare
    highlightTopic(id) {
      this.highlightedTopic = id
    },
    updateSelectedTopic(item) {
      if (this.topics.map((a) => a.id).includes(item.id)) {
        this.$store.commit('analytics/updateTopic', item.id)
        this.highlightTopic(item.id)
      }
    },
    applyHighlight(item) {
      this.highlightTopic(item.id)
    },
    removeHighlight(item) {
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
