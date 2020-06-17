<template>
  <v-card :outlined="outlined" :flat="flat">
    <v-card-title>
      {{ label }}
      ({{ selectedMlMethod }})
    </v-card-title>
    <v-divider></v-divider>
    <!--    <v-card-actions>-->
    <!--      <v-btn icon @click="meta.show = !meta.show">-->
    <!--        <v-icon>mdi-{{ meta.show ? 'help_circle' : 'help_circle_outline' }}</v-icon>-->
    <!--      </v-btn>-->
    <!--    </v-card-actions>-->
    <!--    <v-slide-y-transition>-->
    <!--      <v-card-text v-show="meta.show">-->
    <!--        {{ meta.info }}-->
    <!--      </v-card-text>-->
    <!--    </v-slide-y-transition>-->
    <v-card-text>
      <div :id="divId">
        <sankey-diagram
          ref="sankey"
          :chart-dom-i-d="id"
          :width="width"
          :height="height"
          :dataset="sankeyData"
          @nodeClicked="handleClick"
          @nodeMouseover="handleMouseover"
          @nodeMouseout="handleMouseout"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import SankeyDiagram from './SankeyDiagram'
export default {
  name: 'SankeyDiagramWrapper',
  components: {
    'sankey-diagram': SankeyDiagram,
  },
  props: {
    id: {
      type: String,
      default: 'sankey',
    },
    divId: {
      type: String,
      default: 'sankey-div',
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
      default: 'This Amazing Sankey Diagram',
    },
    selectedMlMethod: {
      type: String,
      default: 'CNN',
    },
    topics: {
      type: Array,
      default() {
        return []
      },
    },
    dataset: {
      type: Object,
      default() {
        return {
          group_topics: [],
          theme_topics: [],
        }
      },
    },
  },
  data() {
    return {
      meta: {
        show: false,
        info: 'Hello this is only a help box!',
      },
    }
  },
  computed: {
    groupsToTopics() {
      const temp = this.dataset.group_topics.filter(
        (item) => item._id === this.selectedMlMethod
      )
      if (temp.length > 0) return temp[0].items
      return []
    },
    themesToTopics() {
      const temp = this.dataset.theme_topics.filter(
        (item) => item._id === this.selectedMlMethod
      )
      if (temp.length > 0) return temp[0].items
      return []
    },
    nodesList() {
      const that = this
      // Gathering all of the topics
      const topics1 = new Set(this.groupsToTopics.map((it) => it._id.topic))
      const topics2 = new Set(this.themesToTopics.map((it) => it._id.topic))
      const nodes1 = [...new Set([...topics2, ...topics1])].map((node) => {
        return {
          id: node,
          name: that.getName(node),
          type: 'topic',
        }
      })
      // Gathering user groups
      const groups = new Set(this.groupsToTopics.map((it) => it._id.group))
      const nodes2 = [...new Set([...groups])].map((node) => {
        return { id: node, name: that.getName(node), type: 'group' }
      })
      // Gathering content themes
      const themes = new Set(this.themesToTopics.map((it) => it._id.theme))
      const nodes3 = [...new Set([...themes])].map((node) => {
        return { id: node, name: that.getName(node), type: 'theme' }
      })
      // Joining the results and sorting them out
      return [...nodes1, ...nodes2, ...nodes3].sort((a, b) => {
        return a.id > b.id ? 1 : -1
      })
    },
    linksList() {
      const links1 = this.groupsToTopics.map((it) => {
        return {
          source: it._id.group,
          target: it._id.topic,
          value: it.count,
        }
      })
      const links2 = this.themesToTopics.map((it) => {
        return {
          source: it._id.topic,
          target: it._id.theme,
          value: it.count,
        }
      })
      // Sorting
      return [...links1, ...links2].sort((a, b) => {
        return a.value > b.value ? 1 : -1
      })
    },
    sankeyData() {
      // Get data from bak and update the values only by each emit
      const res = {
        nodes: [
          { id: 'user_categories', name: 'User Categories' },
          { id: 'topics', name: 'Topics' },
          { id: 'content_themes', name: 'Content Themes' },
          { id: 'sample1', name: 'Sample1' },
          { id: 'sample2', name: 'Sample2' },
        ],
        links: [
          { source: 'user_categories', target: 'topics', value: 1 },
          { source: 'topics', target: 'content_themes', value: 1 },
          { source: 'topics', target: 'sample1', value: 1 },
          { source: 'sample2', target: 'content_themes', value: 3 },
        ],
      }
      if (this.selectedMlMethod === '') return res
      res.nodes = this.nodesList
      res.links = this.linksList
      return res
    },
  },
  methods: {
    handleClick(data) {
      this.$emit('itemClick', data)
    },
    handleMouseover(data) {
      this.$emit('itemMouseover', data)
    },
    handleMouseout(data) {
      this.$emit('itemMouseout', data)
    },
    applyHighlight(data) {
      this.$refs.sankey.mouseover(data, true)
    },
    removeHighlight(data) {
      this.$refs.sankey.mouseout(data, true)
    },
    getName(name) {
      return `${name.charAt(0).toUpperCase()}${name.slice(1)}`
    },
  },
}
</script>

<style scoped></style>
