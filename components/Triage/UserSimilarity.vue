<template>
  <svg
    :id="chartDomID + '-svg'"
    :width="meta.width"
    :height="meta.height"
    :fill-opacity="meta.fillOpacity"
    class="svg similarity"
  >
    <!--ConcentricCircles-->
    <g
      id="concentricCircles"
      :duration="transitionDuration"
      :transform="'translate(' + radius + ',' + chartTopPadding + ')'"
    >
      <!--ConcentricAxis-->
      <g>
        <circle
          v-for="(circle, index) in numberOfTracks + 1"
          :key="index"
          :cx="0"
          :cy="0"
          :r="radiusCalculation(index)"
          :fill="axis.fill"
          :opacity="axis.fillOpacity"
          :stroke="axis.stroke"
          :stroke-width="axis.stroke_width"
          :stroke-opacity="axis.strokeOpacity"
        />
        <!--ConcentricAxisLabels-->
        <text
          v-for="(circle, index) in numberOfTracks"
          :key="`label-${index}`"
          :font-size="2 * radiusCalculation(circle) ** 0.3"
          :opacity="label.opacity"
          :fill="label.fill"
          :transform="
            'translate(' + '0' + ',' + concentricTransform(circle) + ')'
          "
        >
          {{ concentricLabels(circle) }}
        </text>
      </g>
      <!--TOKENS-->
      <g>
        <circle
          v-for="(candid, index) in candidates"
          :key="index"
          :cx="
            PolarToCartesianX(
              tokenRadialScale(findAngle(candid)),
              tokenRadius(candid.w2v)
            )
          "
          :cy="
            PolarToCartesianY(
              tokenRadialScale(findAngle(candid)),
              tokenRadius(candid.w2v)
            )
          "
          :r="circleSize"
          :stroke="strokeColor(candid.screen_name)"
          :stroke-opacity="token.strokeOpacity"
          :stroke-width="strokeSize(candid.screen_name)"
          :fill="'url(#' + candid.screen_name + ')'"
          :fill-opacity="token.opacity"
          @click="(ev) => clicked.call({}, ev, candid)"
        >
          <title>{{ candid.screen_name }}</title>
        </circle>
      </g>
    </g>
  </svg>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'UserSimilarity',
  props: {
    chartDomID: {
      type: String,
      default: 'user-similarity',
    },
    tfidf: {
      type: Object,
      default() {
        return {}
      },
    },
    topics: {
      type: Array,
      default() {
        return []
      },
    },
    meta: {
      type: Object,
      default() {
        return {
          id: 'user-similarity',
          label: 'Agents Similarity',
          width: 500,
          height: 500,
          fillOpacity: 0.6,
          focalUser: 0,
          padding: { top: 0, bottom: 0, left: 0, right: 0 },
        }
      },
    },
    users: {
      type: Array,
      default() {
        return []
      },
    },
    lastSelected: {
      type: String,
      default() {
        return ''
      },
    },
    selectedList: {
      type: Array,
      default() {
        return []
      },
    },
    numberOfTracks: {
      type: Number,
      default() {
        return 3
      },
    },
    axis: {
      type: Object,
      default() {
        return {
          show: true,
          fill: '#e6e9e9',
          fillOpacity: 0.4,
          stroke: '#829ba8',
          stroke_width: '1',
          stroke_opacity: 0.9,
        }
      },
    },
    line: {
      type: Object,
      default() {
        return {
          show: true,
          fill: '#a3ac6e',
          fillOpacity: 0.5,
          stroke: '#d4dee7',
          stroke_width: '0.1',
          stroke_opacity: 0.2,
        }
      },
    },
    token: {
      type: Object,
      default() {
        return {
          size: '10',
          color: '#829ba8',
          opacity: '0.7',
          strokeSize: '0.8',
          strokeOpacity: '0.8',
          strokeColor: '#6eecbf',
        }
      },
    },
    label: {
      type: Object,
      default() {
        return {
          fontSize: '10',
          fill: '#104842',
          opacity: '0.7',
        }
      },
    },
  },
  data() {
    return {
      svg: null,
      transitionDuration: 50,
    }
  },
  computed: {
    radius() {
      return Math.min(this.meta.width) / 2
    },
    /**
     * Places the label of each tracks on its circle (e.g. 1st, 2nd, ...)
     **/
    concentricTransform() {
      return (d) => {
        const circlePadding = 0.9
        return this.radiusCalculation(d) * circlePadding * -1
      }
    },
    /**
     * Returns the radius of the i th track
     * to change the ratio of radius, we should change this function
     * radius(d) = coef * r
     */
    radiusCalculation() {
      return (d) => {
        const coef = ((d + 1) * (d + 2)) / 2
        const total =
          ((this.numberOfTracks + 1) * (this.numberOfTracks + 2)) / 2
        const scale = d3
          .scaleLinear()
          .domain([0, total])
          .range([this.radius / total, this.radius])
        return scale(coef)
      }
    },
    concentricLabels() {
      return (d) => {
        const distance =
          this.meta.adjacency === false ? d : this.meta.tracks - d + 1
        let postfix = 'th'
        if (distance % 10 === 1) postfix = 'st'
        else if (distance % 10 === 2) postfix = 'nd'
        else if (distance % 10 === 3) postfix = 'rd'
        const title = `${distance} ${postfix}`
        return title
      }
    },
    /**
     * Scales a token on its track
     **/
    tokenRadialScale() {
      return d3
        .scaleLinear()
        .domain([0, 1])
        .range([0, 2 * Math.PI])
    },
    circleFill() {
      return (d) => {
        return this.colorToken(d)
      }
    },
    circleSize() {
      return this.radius * 0.06
    },
    strokeSize() {
      return (id) => {
        if (this.selectedList.includes(id)) return 2.5
        else return 0.8
      }
    },
    strokeColor() {
      return (id) => {
        if (this.selectedList.includes(id)) return '#69a63b'
        // if (this.selectedList.includes(id)) return this.colorToken(id)
        else return 'grey'
      }
    },
    colorToken() {
      const that = this
      return d3.scaleOrdinal(
        d3.quantize(d3.interpolateViridis, that.users.length)
      )
    },
    centralUserW2v() {
      return (username) => {
        const findUser = this.users.find(function (ele) {
          return ele.screen_name === username
        })
        return findUser
      }
    },
    /**
     * List of users that can be shown based on selected user
     **/
    candidates() {
      return this.tfidf
      // const array = []
      // let newIndex = 0
      // if (this.lastSelected) {
      //   const focalW2v = this.centralUserW2v(this.lastSelected).w2v
      //   for (const userIndex in this.users)
      //     if (
      //       Math.abs(this.users[userIndex].w2v - focalW2v) <
      //       this.meta.tracks - 1
      //     ) {
      //       array.push({
      //         index: newIndex,
      //         userIndex,
      //         screen_name: this.users[userIndex].screen_name,
      //         w2v: this.users[userIndex].w2v,
      //       })
      //       newIndex += 1
      //     }
      // }
      // return array
    },
    /**
     * Returns the distance of a tweet from the beginning of its corresponded track to scatter users in same level
     * to feed the tokenRadialScale()
     **/
    findAngle() {
      return (candid) => {
        const sameLevel = this.sameLevelUsers(candid.w2v)
        let index = 1
        const totalNumber = sameLevel.length
        for (const user of sameLevel) {
          if (user.screen_name.includes(candid.screen_name)) {
            return index / totalNumber
          } else index++
        }
      }
    },
    /**
     * Returns all users in same level for a certain user
     **/
    sameLevelUsers() {
      return (distance) => {
        const sameDistanceUsers = []
        for (const user of this.users) {
          if (user.w2v === distance) sameDistanceUsers.push(user)
        }
        return sameDistanceUsers
      }
    },
    /**
     * Returns the radius at which the user should be placed
     **/
    tokenRadius() {
      return (userDistance) => {
        const track =
          this.meta.adjacency === false
            ? userDistance
            : this.meta.tracks - userDistance + 1
        return (
          (this.radiusCalculation(track - 1) + this.radiusCalculation(track)) /
          2
        )
      }
    },
    chartTopPadding() {
      return this.meta.padding.top + this.radius
    },
  },
  mounted() {
    this.setupSVG()
  },
  methods: {
    setupSVG() {
      this.svg = d3.select('.concentric')
    },
    /**
     * @return {number}
     */
    PolarToCartesianX(angle, radius) {
      return radius * Math.sin(-(angle + Math.PI))
    },
    PolarToCartesianY(angle, radius) {
      return radius * Math.cos(-(angle + Math.PI))
    },
    clicked(ev, neighbor) {
      this.$emit('neighborSelected', neighbor)
    },
  },
}
</script>

<style scoped></style>
