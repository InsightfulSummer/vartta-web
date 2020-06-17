<template>
  <div :id="divId">
    <sunburst
      :chart-dom-i-d="id"
      :width="width"
      :height="height"
      :dataset="sunburstData"
    ></sunburst>
  </div>
</template>

<script>
import * as d3 from 'd3'
import Sunburst from './Sunburst'
export default {
  name: 'SunburstWrapper',
  components: { Sunburst },
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
    dataset: {
      type: Array,
      default() {
        return []
      },
    },
  },
  computed: {
    sunburstData() {
      let root = {
        height: 0,
      }
      if (this.dataset.length > 0)
        root = d3
          .hierarchy(this.dataset[0])
          .count()
          // .sum(d => (d.children !== undefined ? d.children.length : 1))
          .sort((a, b) => b.value - a.value)
      return d3.partition().size([2 * Math.PI, root.height + 1])(root)
    },
    test1() {
      return this.sunburstData.descendants().slice(1)
    },
  },
}
</script>

<style scoped></style>
