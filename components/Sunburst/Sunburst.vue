<template>
  <svg
    :id="chartDomID + '-svg'"
    :width="chartWidth"
    :height="chartHeight"
    class="svg sunburst"
    :viewBox="[0, 0, chartWidth, chartHeight].join()"
  >
    <g
      :class="'group sunburst-' + chartDomID"
      :transform="'translate(' + chartWidth / 2 + ',' + chartHeight / 2 + ')'"
    >
      <g v-for="(item, index) in dataset.descendants().slice(1)" :key="index">
        <path
          :d="arc(item)"
          :fill="colorScale(item.data.name)"
          :fill-opacity="arcVisible(item) ? (item.children ? 0.9 : 0.4) : 0"
          style="cursor: pointer;"
          @click="clicked"
        >
          <title>{{ item.data.name }}</title>
        </path>
      </g>
      <g pointer-events="null" text-anchor="middle" style="user-select: none;">
        <text
          v-for="(item, index) in dataset.descendants().slice(1)"
          :key="index"
          dy="0.35em"
          class="sunburst-text"
          :fill-opacity="labelVisible(item)"
          :transform="labelTransform(item)"
        >
          {{ item.data.name }}
        </text>
      </g>
      <circle :r="arcRadius" fill="none"></circle>
    </g>
  </svg>
</template>

<script>
import * as d3 from 'd3'
export default {
  name: 'Sunburst',
  props: {
    chartDomID: {
      type: String,
      default: 'sunburst',
    },
    height: {
      type: Number,
      default: 200,
    },
    width: {
      type: Number,
      default: 300,
    },
    padding: {
      type: Object,
      default() {
        return {
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        }
      },
    },
    dataset: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  computed: {
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
    arcRadius() {
      return this.chartWidth / 7
    },
    arc() {
      return d3
        .arc()
        .startAngle((d) => d.x0)
        .endAngle((d) => d.x1)
        .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.01))
        .padRadius(this.arcRadius * 2)
        .innerRadius((d) => d.y0 * this.arcRadius)
        .outerRadius((d) =>
          Math.max(d.y0 * this.arcRadius, d.y1 * this.arcRadius - 1)
        )
    },
    labelTransform() {
      return (d) => {
        const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI
        const y = ((d.y0 + d.y1) / 2) * this.arcRadius
        return `rotate(${x - 90}) translate(${y},0) rotate(${
          x < 180 ? 0 : 180
        })`
      }
    },
    labelVisible() {
      return (d) => {
        return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03
      }
    },
    arcVisible() {
      return (d) => {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0
      }
    },
    colorScale() {
      const that = this
      return d3.scaleOrdinal(
        d3.quantize(d3.interpolateRainbow, that.dataset.children.length + 1)
      )
    },
  },
  methods: {
    clicked(ev) {},
  },
}
</script>

<style scoped>
.sunburst {
}

.sunburst-text {
  font-size: 0.8vmax;
}

.group {
  background-color: blue;
}
</style>
