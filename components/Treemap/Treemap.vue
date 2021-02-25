<template>
  <div>
    <svg id="treeMapViz" :viewBox="[0, 0, width, height]" class="viewBoxStyle">
      <g
        v-for="(leaf, index) in treeMapLeaves"
        :key="index"
        :transform="'translate(' + leaf.x0 + ',' + leaf.y0 + ')'"
      >
        <rect
          :id="index + 'leaf'"
          :width="rectWidth(leaf)"
          :height="rectHeight(leaf)"
          :fill="rectColor(leaf)"
          class="rectStyle"
        ></rect>
        <text
          class="viewBoxStyle"
          :transform="
            'translate(' + textTransform[0] + ',' + textTransform[1] + ')'
          "
        >
          {{ leaf.data.name }}
        </text>
        <circle
          v-for="(user, ind) in leaf.data.value"
          :key="ind"
          :cx="circleXPos(leaf)(ind + (1 % totcol(leaf)))"
          :cy="circleYPos(leaf)(Math.ceil(ind / totcol(leaf)))"
          :r="10"
          :transform="
            'translate(' +
            textTransform[0] +
            ',' +
            (textTransform[1] + 60) +
            ')'
          "
        ></circle>
      </g>
    </svg>
  </div>
</template>
<script>
import * as d3 from 'd3'
import * as underscore from 'underscore'
export default {
  props: {
    width: {
      type: Number,
      default: 1000,
    },
    height: {
      type: Number,
      default: 1000,
    },
    users: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      colorScale: d3.scaleOrdinal(d3.schemeAccent),
      textTransform: [30, 30],
    }
  },
  computed: {
    treeMapData() {
      const root = this.treeMapFunc(this.heirarchicalCountries)
      return root
    },
    treeMapLeaves() {
      const leaves = this.treeMapData.leaves()
      return leaves
    },
    rectColor() {
      return function (d) {
        while (d.depth > 1) d = d.parent
        return this.colorScale(d.data.name)
      }
    },
    countries() {
      const groupedByCountry = underscore.groupBy(this.users, (u) => {
        return u.location.country
      })
      for (const index in groupedByCountry) {
        groupedByCountry[index] = underscore.groupBy(
          groupedByCountry[index],
          (u) => {
            return u.location.state
          }
        )
      }
      return groupedByCountry
    },
    heirarchicalCountries() {
      const highLevelChildren = []
      for (const countryName of Object.keys(this.countries)) {
        const country = this.countries[countryName]
        const children = []
        for (const stateName of Object.keys(country)) {
          children.push({
            name: stateName,
            users: country[stateName],
            value: country[stateName].length,
          })
        }
        highLevelChildren.push({
          name: countryName,
          children,
        })
      }
      return {
        name: 'countries',
        children: highLevelChildren,
      }
    },

    totcol() {
      return function (d) {
        return this.rectWidth(d) / 40
      }
    },
    // Total rows
    totRow() {
      return function (d) {
        return this.rectHeight(d) / 40
      }
    },

    // Calculates the domain for xScale
    xScaleDomain() {
      return function (d) {
        const xScaleValue = []
        for (let i = 1; i <= this.totcol(d); i++) xScaleValue.push(i)
        return xScaleValue
      }
    },
    // Calculates the domain for yScale
    yScaleDomain() {
      return function (d) {
        const yScaleValue = []
        for (let i = 1; i <= this.totRow(d); i++) yScaleValue.push(i)
        return yScaleValue
      }
    },
    // Creates the xScaleBand
    circleXPos() {
      return function (d) {
        return d3
          .scaleBand()
          .domain(this.xScaleDomain(d))
          .range([0, this.rectWidth(d)])
      }
    },
    // Creates the yScaleBand
    circleYPos(d) {
      return function (d) {
        return d3
          .scaleBand()
          .domain(this.yScaleDomain(d))
          .range([0, this.rectHeight(d)])
      }
    },
  },
  methods: {
    treeMapFunc(da) {
      const temp = d3
        .treemap()
        .tile(d3.treemapSquarify)
        .size([this.width, this.height])
        .padding(1)
        .round(true)
      return temp(d3.hierarchy(da).sum((d) => d.value)).sort(
        (a, b) => a.value - b.value
      )
    },
    rectWidth(d) {
      return d.x1 - d.x0
    },
    rectHeight(d) {
      return d.y1 - d.y0
    },
  },
}
</script>
<style>
.viewBoxStyle {
  font: sans-serif;
  font-size: 20px;
}
.rectStyle {
  fill-opacity: 0.6;
  stroke: #0000;
  stroke-width: 3px;
}
</style>
