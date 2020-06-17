<template>
  <v-card :outlined="outlined" :flat="flat">
    <v-card-title>
      {{ label }}
      ({{ selectedTopic }} {{ selectedAnalysisMethod }} )
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <div :id="divId">
        <heat-map
          :chart-dom-i-d="id"
          :width="width"
          :height="height"
          :color-range="colorRange"
          :dataset="heatmapData"
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
    <!--        <span class="caption theme&#45;&#45;light">Low Values:</span>-->
    <!--        <input v-model="colorRange[0]" type="color" />-->

    <!--        <v-spacer></v-spacer>-->

    <!--        <span class="caption theme&#45;&#45;light">High Values:</span>-->
    <!--        <input v-model="colorRange[1]" type="color" />-->
    <!--      </v-card-actions>-->
    <!--    </v-slide-y-transition>-->
  </v-card>
</template>

<script>
import HeatMap from './HeatMap'
export default {
  name: 'HeatMapWrapper',
  components: {
    'heat-map': HeatMap,
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
    flat: {
      type: Boolean,
      default: true,
    },
    outlined: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: 'This Amazing Scatter Plot',
    },
    dataset: {
      type: Object,
      default() {
        return {
          themes: [],
          groups: [],
        }
      },
    },
    selectedAnalysisMethod: {
      type: String,
      default: '',
    },
    selectedMachineLearningMethod: {
      type: String,
      default: '',
    },
    selectedTopic: {
      type: String,
      default: 'hiv',
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
    heatmapData() {
      if (
        this.selectedMachineLearningMethod === '' ||
        this.selectedSentimentAnalysisMethod === ''
      )
        return []
      const that = this
      const final = []
      const filteredThemes = this.dataset.themes.filter((it) => {
        return (
          it._id.analysis === that.selectedAnalysisMethod &&
          it._id.labeling === that.selectedMachineLearningMethod &&
          it._id.topic === that.selectedTopic
        )
      })
      for (const it of filteredThemes) {
        for (const kw of it._id.keywords) {
          final.push({
            x: kw,
            y: 'Theme: ' + it._id.theme,
            v: it.avgSentiment,
            sort: 1,
          })
        }
      }
      const filteredGroups = this.dataset.groups.filter((it) => {
        return (
          it._id.analysis === that.selectedAnalysisMethod &&
          it._id.labeling === that.selectedMachineLearningMethod &&
          it._id.topic === that.selectedTopic
        )
      })
      for (const it of filteredGroups) {
        for (const kw of it._id.keywords) {
          final.push({
            x: kw,
            y: 'Group: ' + it._id.group,
            v: it.avgSentiment,
            sort: 0,
          })
        }
      }
      return final.sort((a, b) => {
        return a.sort > b.sort ? 1 : -1
      })
    },
  },
}
</script>

<style scoped></style>
