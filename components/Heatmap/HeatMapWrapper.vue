<template>
  <v-card :outlined="outlined" :flat="flat" @contextmenu="showContextMenu">
    <v-card-title>
      {{ label }}
      ({{ selectedTopic }} {{ selectedAnalysisMethod }} )
      <v-spacer></v-spacer>
      <v-menu open-on-hover bottom offset-y>
        <template #activator="{ on }">
          <v-btn icon small v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item link @click="saveSVG">
            <v-list-item-icon>
              <v-icon>mdi-content-save-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Save SVG</v-list-item-title>
          </v-list-item>
          <v-list-item link>
            <v-list-item-icon>
              <v-icon>mdi-arrow-expand</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Expand</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
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
    <v-menu
      v-model="menu.show"
      :position-x="menu.x"
      :position-y="menu.y"
      open-on-hover
      absolute
      offset-y
    >
      <v-list>
        <v-list-item link @click="saveSVG">
          <v-list-item-title>Save SVG</v-list-item-title>
        </v-list-item>
        <v-list-item link>
          <v-list-item-title>Expand</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

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
      menu: {
        show: false,
        x: 0,
        y: 0,
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
  methods: {
    showContextMenu(e) {
      e.preventDefault()
      this.menu.show = false
      this.menu.x = e.clientX
      this.menu.y = e.clientY
      this.$nextTick(() => {
        this.menu.show = true
      })
    },
    saveSVG() {
      const config = {
        filename: 'customFileName',
      }
      const that = this
      this.$d3SaveSVG.save(
        that.$d3.select('#' + that.id + '-svg').node(),
        config
      )
    },
  },
}
</script>

<style scoped></style>
