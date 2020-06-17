<template>
  <svg
    :id="chartDomID + '-svg'"
    :width="width"
    :height="height"
    class="svg sankey"
  >
    <g id="links" fill="none" stroke-opacity="0.5">
      <g
        v-for="(link, index) in sankyed.links"
        :key="index"
        style="mix-blend-mode: multiply;"
      >
        <linearGradient
          :id="specialID + '-gradient-' + link.source.id + '-' + link.target.id"
          gradientUnits="userSpaceOnUse"
          :x1="link.source.x1"
          :x2="link.target.x0"
        >
          <stop offset="0%" :stop-color="color(link.source.id)"></stop>
          <stop offset="100%" :stop-color="color(link.target.id)"></stop>
        </linearGradient>
        <path
          :id="specialID + '-path-' + link.source.id + '-' + link.target.id"
          :class="'path ' + specialID + '-object'"
          :d="d(link)"
          :stroke="
            'url(#' +
            specialID +
            '-gradient-' +
            link.source.id +
            '-' +
            link.target.id +
            ')'
          "
          :stroke-width="Math.max(1, link.width)"
        ></path>
        <title>
          {{ link.source.name }} → {{ link.target.name }}
          {{ format(link.value) }}
        </title>
      </g>
    </g>
    <g id="rects" class="rects" stroke="#000">
      <g
        v-for="(item, index) in sankyed.nodes"
        :id="specialID + '-node-' + item.id"
        :key="index"
        :class="'node ' + specialID + '-object'"
        @click="$emit('nodeClicked', item)"
        @mouseover="mouseover(item)"
        @mouseout="mouseout(item)"
      >
        <rect
          :x="item.x0"
          :width="item.x1 - item.x0"
          :y="item.y0"
          :height="item.y1 - item.y0"
          :fill="color(item.id)"
          stroke="none"
          class="rect"
        ></rect>
        <text
          :x="item.x0 < chartWidth / 2 ? item.x1 + 6 : item.x0 - 6"
          :y="(item.y1 + item.y0) / 2"
          :text-anchor="item.x0 < chartWidth / 2 ? 'start' : 'end'"
          class="label body-1"
        >
          {{ item.name }}
        </text>
      </g>
    </g>
  </svg>
</template>

<script>
import * as d3 from 'd3'
import * as d3Sankey from 'd3-sankey'
export default {
  name: 'SankeyDiagram',
  props: {
    chartDomID: {
      type: String,
      default: 'sankey-diagram',
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
      type: Object,
      default() {
        return {
          nodes: [],
          links: [],
        }
      },
    },
    padding: {
      type: Object,
      default() {
        return {
          top: 5,
          right: 5,
          left: 5,
          bottom: 5,
        }
      },
    },
  },
  data() {
    return {
      svg: null,
      rectsGroup: null,
      linksGroup: null,
    }
  },
  computed: {
    specialID() {
      return 'sankey-' + this.chartDomID
    },
    chartLeft() {
      return this.padding.left
    },
    chartRight() {
      return this.width - this.padding.right
    },
    chartBottom() {
      return this.height - this.padding.bottom
    },
    chartTop() {
      return this.padding.top
    },
    chartHeight() {
      return this.chartBottom - this.chartTop
    },
    chartWidth() {
      return this.chartRight - this.chartLeft
    },
    sankyed() {
      const sankey = d3Sankey
        .sankey()
        .nodeId((node) => node.id)
        .nodeAlign(d3Sankey.sankeyJustify)
        .nodeWidth(20)
        .nodePadding(10)
        .extent([
          [1, 5],
          [this.chartWidth - 1, this.chartHeight - 5],
        ])
      return sankey({
        nodes: this.dataset.nodes.map((d) => Object.assign({}, d)),
        links: this.dataset.links.map((d) => Object.assign({}, d)),
      })
    },
    color() {
      const idToNumScale = d3
        .scaleLinear()
        .domain([0, this.sankyed.nodes.length])
        .range([0, 1])
      const color = d3.scaleSequential(d3.interpolateTurbo)
      return (id) => {
        return color(
          idToNumScale(this.sankyed.nodes.findIndex((a) => a.id === id))
        )
      }
    },
    format() {
      // TODO
      const f = d3.format('.0%')
      return (d) => {
        const num =
          d /
          this.sankyed.links
            .map((l) => l.value)
            .reduce((sum, v) => {
              return sum + v
            })

        return f(num)
        // return f(d)
      }
    },
    d() {
      return d3Sankey.sankeyLinkHorizontal()
    },
  },
  beforeUpdate() {},
  mounted() {
    // Setup the SVG and Groups
    this.setupSVG()
  },
  methods: {
    setupSVG() {
      // Select the SVG element
      this.svg = d3.select('.sankey')
      this.rectsGroup = d3.select('.rects')
      this.linksGroup = d3.select('.links')
    },
    mouseover(item, manual = false) {
      // Identify the nodes - paths and rects - that should be highlighted
      const whiteList = []
      item = this.sankyed.nodes.find((a) => a.id === item.id)
      if (!item) return

      // Select the paths that should be highlighted
      for (const link of [...item.targetLinks, ...item.sourceLinks]) {
        // The link itself
        whiteList.push(
          this.specialID + '-path-' + link.source.id + '-' + link.target.id
        )
        // Target and source nodes
        whiteList.push(this.specialID + '-node-' + link.source.id)
        whiteList.push(this.specialID + '-node-' + link.target.id)
      }
      whiteList.push(this.specialID + '-node-' + item.id)

      // Add greyed class to all of objects
      const elems = document.getElementsByClassName(this.specialID + '-object')
      for (const el of elems) {
        // Prevent error while brushing
        if (el) {
          el.classList.remove('highlighted')
          el.classList.add('greyed')
        }
      }

      // Highlight the known elements
      for (const elem of whiteList) {
        // Prevent error while brushing
        const element = document.getElementById(elem)
        if (element) {
          element.classList.remove('greyed')
          element.classList.add('highlighted')
        }
      }
      if (!manual) this.$emit('nodeMouseover', item)
    },
    mouseout(item, manual = false) {
      const elems = document.getElementsByClassName(this.specialID + '-object')
      for (const el of elems) {
        el.classList.remove('highlighted')
        el.classList.remove('greyed')
      }
      if (!manual) this.$emit('nodeMouseout', item)
    },
  },
}
</script>

<style scoped>
/* Item Labels */
.svg >>> .label {
  fill: currentColor;
  stroke: currentColor;
}

.svg >>> .greyed {
  opacity: 0.2;
  stroke-opacity: 0.2;
}

.svg >>> .highlighted {
  opacity: 1;
  stroke-opacity: unset;
}

.svg >>> * {
  transition: 50ms;
}
</style>
