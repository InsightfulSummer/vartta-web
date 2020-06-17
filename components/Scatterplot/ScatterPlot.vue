<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
    <svg
      :id="chartDomID + '-svg'"
      :width="width"
      :height="height"
      :class="'svg scatterplot-' + chartDomID"
    >
      <defs>
        <pattern
          v-for="(item, index) in dataset"
          :id="item.user.screen_name"
          :key="index + '-' + item.user.screen_name + '-image'"
          patternContentUnits="objectBoundingBox"
          height="100%"
          width="100%"
        >
          <image
            width="1"
            height="1"
            preserveAspectRatio="none"
            :xlink:href="item.user.profile_image_url_https"
          ></image>
        </pattern>
      </defs>
      <rect
        :class="'view view-' + chartDomID"
        :x="chartLeft"
        :y="chartTop"
        :width="chartWidth"
        :height="chartHeight"
      ></rect>
      <g
        :class="'axis x-axis scatterplot-' + chartDomID + '-x-axis'"
        :transform="'translate(' + chartLeft + ',' + chartBottom + ')'"
      >
        <text
          class="label title"
          :transform="'translate(' + (chartWidth / 2 + 90) + ',+31)'"
        >
          {{ axesMeta.x.label }}
        </text>
      </g>
      <g
        :class="'axis y-axis scatterplot-' + chartDomID + '-y-axis'"
        :transform="'translate(' + chartLeft + ',' + chartTop + ')'"
      >
        <text
          class="label title"
          :transform="
            'rotate(-90) translate(' + -(chartHeight / 2 - 70) + ',-25)'
          "
        >
          {{ axesMeta.y.label }}
        </text>
      </g>
      <path
        v-if="line.show"
        class="line"
        :fill="line.fill"
        :stroke="line.stroke"
        :stroke-width="line.stroke_width"
        :transform="'translate(' + chartLeft + ',' + chartTop + ')'"
        :d="linePath(dataset)"
      ></path>
      <transition-group
        :id="'circles-' + chartDomID"
        tag="g"
        name="fade"
        :x="chartLeft"
        :y="chartTop"
        :width="chartWidth"
        :height="chartHeight"
        :duration="transitionDuration"
        :appear="true"
      >
        <circle
          v-for="(item, index) in dataset"
          :id="'svg_circle_' + item.user.screen_name"
          :key="item.id_str + index"
          :cx="xScale(item[axesMeta.x.selector])"
          :cy="yScale(item[axesMeta.y.selector])"
          :stroke="item.highlighted ? 'gray' : item.selected ? 'red' : ''"
          :stroke-width="item.selected || item.highlighted ? '3' : '0'"
          :r="radius"
          :fill="'url(#' + item.user.screen_name + ')'"
          class="circle"
          @click="(ev) => clicked.call({}, ev, item)"
          @mouseover="(ev) => highlight.call({}, ev, item)"
          @mouseleave="(ev) => dim.call({}, ev, item)"
        ></circle>
      </transition-group>
    </svg>
    <div
      v-if="contextMenu"
      :id="chartDomID + '-tooltip'"
      class="tooltip"
      style="position: fixed; opacity: 0; z-index: 999; overflow: auto;"
    >
      <v-sheet class="d-flex" color="black" dark>
        <v-data-table
          :headers="selectedTweetAnalysisHeaders"
          :items="highlightedData.analysis"
          hide-actions
        >
          <template v-slot:items="props">
            <td>{{ props.item.title }}</td>
            <td>{{ +props.item.result.toPrecision(4) }}</td>
          </template>
        </v-data-table>
      </v-sheet>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import TweetCollection from '../Twitter/TweetCollection'
export default {
  name: 'ScatterPlot',
  // eslint-disable-next-line vue/no-unused-components
  components: { TweetCollection },
  props: {
    contextMenu: {
      type: Boolean,
      default: false,
    },
    chartDomID: {
      type: String,
      default: 'scatter-plot',
    },
    height: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 0,
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
    axesMeta: {
      type: Object,
      default() {
        return {
          x: {
            selector: 'x',
            initialBound: [-1, 200],
            scaleToContent: true,
            zoomEnabled: true,
            label: 'User Influence',
            show: true,
          },
          y: {
            selector: 'y',
            initialBound: [-1, 1],
            scaleToContent: false,
            zoomEnabled: true,
            label: 'Average Sentiment',
            show: true,
          },
        }
      },
    },
    radius: {
      type: Number,
      default: 24,
    },
    colorRange: {
      type: Array,
      default() {
        return ['#bbd6f4', '#1c008b']
      },
    },
    dataset: {
      type: Array,
      default() {
        return []
      },
    },
    selectedData: {
      type: Object,
      default() {
        return []
      },
    },
    padding: {
      type: Object,
      default() {
        return {
          top: 5,
          right: 5,
          left: 40,
          bottom: 40,
        }
      },
    },
    transform: {
      type: Object,
      default() {
        return d3.zoomIdentity
      },
    },
  },
  data() {
    return {
      svg: null,
      tooltip: null,
      circlesGroup: null,
      view: null,
      highlightedData: {},
      axes: {
        x: {
          ticks: 10,
          element: null,
        },
        y: {
          ticks: 10,
          element: null,
        },
      },
      zoom: null,
      transitionDuration: 200,
    }
  },
  computed: {
    selectedTweetAnalysisHeaders() {
      return [
        {
          text: 'Analysis Method',
          align: 'left',
          sortable: true,
          value: 'title',
        },
        {
          text: 'Sentiment',
          align: 'left',
          sortable: true,
          value: 'result',
        },
      ]
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
    xScale() {
      const selector = this.axesMeta.x.selector
      let min = this.axesMeta.x.initialBound[0]
      let max = this.axesMeta.x.initialBound[1]
      if (this.axesMeta.x.scaleToContent) {
        min = d3.min(this.dataset, function (d) {
          return d[selector]
        })
        max = d3.max(this.dataset, function (d) {
          return d[selector]
        })
      }
      let x = d3.scaleLinear()
      if (this.axesMeta.x.isTime) {
        min = new Date(min)
        max = new Date(max)
        x = d3.scaleTime()
      }
      x.domain([min, max]).range([0, this.chartWidth]).nice()
      if (this.axesMeta.x.zoomEnabled) return this.transform.rescaleX(x)
      else return x
    },
    yScale() {
      const selector = this.axesMeta.y.selector
      let min = this.axesMeta.y.initialBound[0]
      let max = this.axesMeta.y.initialBound[1]
      if (this.axesMeta.y.scaleToContent) {
        min = d3.min(this.dataset, function (d) {
          return d[selector]
        })
        max = d3.max(this.dataset, function (d) {
          return d[selector]
        })
      }
      const y = d3
        .scaleLinear()
        .domain([min, max])
        .range([this.chartHeight, 0])
        .nice()
      if (this.axesMeta.y.zoomEnabled) return this.transform.rescaleY(y)
      else return y
    },
    colorScale() {
      return d3
        .scaleLinear()
        .range(this.colorRange)
        .domain([0, this.dataset.length - 1])
    },
    xAxisFunction() {
      return d3
        .axisBottom(this.xScale)
        .tickSize(-this.chartHeight)
        .ticks((this.width / this.height) * 10)
      // return d3.axisBottom(this.xScale).ticks((this.width / this.height) * 10)
    },
    yAxisFunction() {
      return d3
        .axisLeft(this.yScale)
        .tickSize(-this.chartWidth)
        .ticks(this.axes.y.ticks)
      // return d3.axisLeft(this.yScale).tickSize(this.chartHeight)
    },
    linePath() {
      const that = this
      return d3
        .line()
        .curve(d3.curveLinear) // Just add that to have a curve instead of segments
        .x(function (d) {
          return that.xScale(d[that.axesMeta.x.selector])
        })
        .y(function (d) {
          return that.yScale(d[that.axesMeta.y.selector])
        })
    },
  },
  beforeUpdate() {
    // re-draw axes
    this.drawAxes()
  },
  mounted() {
    // Setup the SVG and Groups
    this.setupSVG()

    // call zoom behaviour
    this.callZoomBehaviour()
  },
  methods: {
    setupSVG() {
      // Select the SVG element
      this.svg = d3.select('.scatterplot-' + this.chartDomID)
      this.tooltip = d3.select('#' + this.chartDomID + '-tooltip')
      this.circlesGroup = d3.select('#circles-' + this.chartDomID)
      this.view = d3.select('.view-' + this.chartDomID)
      this.axes.x.element = d3.select(
        '.scatterplot-' + this.chartDomID + '-x-axis'
      )
      this.axes.y.element = d3.select(
        '.scatterplot-' + this.chartDomID + '-y-axis'
      )
    },
    drawAxes() {
      // Draw X axis without transformation
      this.axes.x.element.call(this.xAxisFunction)

      // Draw Y axis without transformation
      this.axes.y.element.call(this.yAxisFunction)

      // reset zoom
      // this.resetZoom()
    },
    callZoomBehaviour() {
      const that = this
      this.zoom = d3.zoom().on('zoom', () => {
        that.$emit('zoomed', d3.event.transform)
        // that.transform = d3.event.transform
      })
      this.view.call(this.zoom)
    },
    resetZoom() {
      // reset the zoom
      if (this.zoom) this.view.call(this.zoom.transform, d3.zoomIdentity)
    },
    clicked(ev, item) {
      item.selected = !item.selected
      // ev.target.setAttribute('stroke', 'red')
      // ev.target.setAttribute('stroke-width', '3')

      // this.highlightedData = item
      // this.tooltip
      //   .transition()
      //   .duration(200)
      //   .style('opacity', 0.9)
      //   .style('left', ev.target.getBoundingClientRect().x + 28 + 'px')
      //   .style('top', ev.target.getBoundingClientRect().y + 28 + 'px')
      // if (this.tooltip.attr('persist') === '0')
      //   this.tooltip.attr('persist', '1')
      // else if (this.tooltip.attr('persist') === '1')
      //   this.tooltip.attr('persist', '0')
      this.$emit('circleClicked', item)
    },
    highlight(ev, item) {
      item.highlighted = true
      this.highlightedData = item
      if (this.contextMenu) {
        this.tooltip
          .transition()
          .duration(200)
          .style('opacity', 0.9)
          .style('left', ev.target.getBoundingClientRect().x + 28 + 'px')
          .style('top', ev.target.getBoundingClientRect().y + 28 + 'px')
        this.tooltip.attr('persist', '0')
      }
      this.$emit('highlight', ev)
    },
    dim(ev, item) {
      item.highlighted = false
      if (this.contextMenu) {
        if (this.tooltip.attr('persist') === '0') {
          if (item.selected) ev.target.setAttribute('stroke', 'red')
          else {
            ev.target.setAttribute('stroke', '')
            ev.target.setAttribute('stroke-width', '0')
          }
          this.tooltip.transition().duration(500).style('opacity', 0)
          this.highlightedData = {}
        }
      }
      this.$emit('dim', item)
    },
  },
}
</script>

<style scoped>
.svg {
  /*background: lightgrey;*/
}

.view {
  fill: transparent;
}

/* Gridlines */
.axis >>> .tick line {
  stroke: #e6deec;
  stroke-dasharray: 1;
}

/* Axis Labels */
.svg >>> .label {
  fill: currentColor;
  stroke: currentColor;
  text-anchor: end;
}

.svg >>> .fade-enter {
  opacity: 0;
}

.svg >>> .fade-enter-to {
  opacity: 100%;
  fill: green;
}

.svg >>> .fade-leave {
  opacity: 100%;
}

.svg >>> .fade-leave-to {
  opacity: 0;
  fill: red;
}

.svg >>> .circle,
.svg >>> .line {
  transition: all 0ms;
  -webkit-transition: all 0ms;
}

.fade-enter-active {
  fill: green;
}

.fade-leave-active {
  fill: brown;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
