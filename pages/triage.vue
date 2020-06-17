<template>
  <v-row justify="center" dense no-gutters>
    <v-col cols="6">
      <v-card outlined class="mx-0 px-0">
        <v-card-actions>
          <span class="v-card__title">User-Topic Association</span>
          <v-spacer></v-spacer>
          <v-switch
            v-model="charts.topicUserDiagram.sunburst"
            inset
            label="Sunburst"
          ></v-switch>
        </v-card-actions>
        <v-divider></v-divider>
        <v-card-text :id="charts.topicUserDiagram.id" class="mx-0 px-1">
          <topic-user
            :meta="charts.topicUserDiagram"
            :topics="topics"
            :users="usersRawSet"
            :selected-list="allSelected"
            @userSelected="updateSelectedUsers"
          ></topic-user>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="6">
      <v-card outlined class="mx-0 px-0">
        <v-card-actions>
          <span class="v-card__title">Appearance Timeline</span>
          <v-spacer></v-spacer>
          <v-btn
            icon
            text
            @click="
              charts.concentricChart.tracks =
                charts.concentricChart.tracks < 10
                  ? charts.concentricChart.tracks + 1
                  : 1
            "
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-radio-group v-model="charts.concentricChart.timeUnit" row>
            <v-radio label="Y" value="12"></v-radio>
            <v-radio label="M" value="30"></v-radio>
            <v-radio label="W" value="7"></v-radio>
            <v-radio label="D" value="24"></v-radio>
            <v-radio label="H" value="60"></v-radio>
          </v-radio-group>
        </v-card-actions>
        <v-divider></v-divider>
        <v-card-text :id="charts.concentricChart.id" class="mx-0 px-1">
          <concentric-chart
            :meta="charts.concentricChart"
            :topics="topics"
            :users="usersRawSet"
            :number-of-tracks="charts.concentricChart.tracks"
            :selected-list="allSelected"
            @candidSelected="updateSelectedUsers"
          ></concentric-chart>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12">
      <v-card outlined>
        <v-card-title>
          User Similarity (TF-IDF
          {{
            selectedUserForComparison
              ? '- Compared To: @' + selectedUserForComparison.screen_name + ')'
              : ')'
          }}
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-data-table
            :headers="[
              { text: 'Username', value: 'compared_to', align: 'start' },
              { text: 'Cosine Similarity', value: 'result' },
            ]"
            :items="selectedComparisons"
            class="elevation-1"
          >
            <template v-slot:item.compared_to="{ item }">
              <v-chip pill>
                <v-avatar left>
                  <v-img
                    :src="
                      comparedToUser(item.compared_to).profile_image_url_https
                    "
                  ></v-img>
                </v-avatar>
                {{ comparedToUser(item.compared_to).name }}
                @{{ comparedToUser(item.compared_to).screen_name }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
      <!--      <v-card outlined class="mx-0 px-0">-->
      <!--        <v-card-title>User Distance</v-card-title>-->
      <!--        <v-divider></v-divider>-->
      <!--        <v-card-text :id="charts.userSimilarity.id" class="mx-0 px-1">-->
      <!--          <user-similarity-->
      <!--            :meta="charts.userSimilarity"-->
      <!--            :topics="topics"-->
      <!--            :users="usersRawSet"-->
      <!--            :selected-list="allSelected"-->
      <!--            :number-of-tracks="charts.userSimilarity.tracks"-->
      <!--            :comparisons="tfidf"-->
      <!--            :last-selected="lastSelectedUser"-->
      <!--            @neighborSelected="updateSelectedUsers"-->
      <!--          ></user-similarity>-->
      <!--        </v-card-text>-->
      <!--        <v-card-actions>-->
      <!--          <v-btn-->
      <!--            @click="-->
      <!--              charts.userSimilarity.tracks =-->
      <!--                charts.userSimilarity.tracks < 4-->
      <!--                  ? charts.userSimilarity.tracks + 1-->
      <!--                  : 1-->
      <!--            "-->
      <!--          >-->
      <!--            NUMBER OF Neighbors {{ charts.userSimilarity.tracks }}-->
      <!--          </v-btn>-->
      <!--          <v-btn-->
      <!--            @click="-->
      <!--              charts.userSimilarity.adjacency = !charts.userSimilarity.adjacency-->
      <!--            "-->
      <!--          >-->
      <!--            Adjacency-->
      <!--          </v-btn>-->
      <!--        </v-card-actions>-->
      <!--      </v-card>-->
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-card-title>User Details</v-card-title>
        <v-card-text>
          <v-row
            id="users-columns"
            align="start"
            justify="start"
            class="smooth-scroll flex-nowrap"
            style="height: 100%; max-height: 100%;"
            dense
            no-gutters
          >
            <tweet-collection
              v-for="(user, index) in allSelected"
              :id="'column-' + user.screen_name"
              :key="'column-' + index"
              :tweets="user.tweets"
              :title="user.name + ' @' + user.screen_name"
              :vertical-portion="40"
            ></tweet-collection>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import TopicUser from '../components/Triage/TopicUserAssociationDiagram'
import ConcentricChart from '../components/Triage/ConcentricChart'
import TweetCollection from '~/components/Twitter/TweetCollection'
// import UserSimilarity from '../components/Triage/UserSimilarity'
// import UserInfo from '../components/Triage/UserInfo'
export default {
  name: 'Triage',
  layout: 'triage',
  components: {
    // UserInfo,
    // UserSimilarity,
    TopicUser,
    ConcentricChart,
    TweetCollection,
    // Treemap,
  },
  data() {
    return {
      flat: true,
      color: 'transparent',
      highlightedTopic: '',
      msg: '',
      temp: [],
      // Charts and all of their configurations
      charts: {
        topicUserDiagram: {
          id: 'topic-user-diagram',
          label: 'Agent-Topic Association ',
          width: 400,
          height: 400,
          sunburst: true,
        },
        concentricChart: {
          id: 'concentric-chart',
          label: 'Agent-Time Association ',
          width: 400,
          height: 400,
          padding: { top: 0, bottom: 0, left: 0, right: 0 },
          tracks: 3,
          timeUnit: '12',
        },
        userSimilarity: {
          id: 'user-similarity',
          label: 'Agents Similarity',
          width: 400,
          height: 400,
          padding: { top: 20, bottom: 0, left: 0, right: 0 },
          tracks: 3,
          focalUser: 0,
          adjacency: false,
        },
      },
    }
  },
  computed: {
    allSelected() {
      return this.$store.state.triage.selectedUsers
    },
    usersRawSet() {
      return this.$store.state.triage.users
    },
    topics() {
      return this.$store.state.topics
    },
    tfidf() {
      return this.$store.state.triage.TFIDF
    },
    selectedUserForComparison() {
      return this.$store.state.triage.selectedUserForComparison
    },
    selectedComparisons() {
      return this.selectedUserForComparison
        ? this.tfidf[this.selectedUserForComparison.screen_name]
        : []
    },
    comparedToUser() {
      return (username) => {
        const list = this.usersRawSet.filter((u) => u.screen_name === username)
        let res = null
        if (list.length === 1) res = list[0]
        else res = { profile_image_url_https: '', screen_name: '' }
        return res
      }
    },
  },
  mounted() {
    window.addEventListener('resize', this.resize)
    this.resize()
  },
  methods: {
    resize() {
      const chordDiv = document.getElementById(this.charts.topicUserDiagram.id)
      const concentricDiv = document.getElementById(
        this.charts.concentricChart.id
      )
      const similarityDiv = document.getElementById(
        this.charts.userSimilarity.id
      )
      if (chordDiv) {
        this.charts.topicUserDiagram.width = chordDiv.clientWidth - 9
        this.charts.topicUserDiagram.height = chordDiv.clientWidth - 9
      }
      if (concentricDiv) {
        this.charts.concentricChart.width = concentricDiv.clientWidth - 20
        this.charts.concentricChart.height = concentricDiv.clientWidth - 20
      }
      if (similarityDiv) {
        this.charts.userSimilarity.width = similarityDiv.clientWidth - 20
        this.charts.userSimilarity.height = similarityDiv.clientWidth - 20
      }
    },
    /***
     *
     * Candid in the ConcentricChart component have different attributes (name) instead of screen_name
     * so two different functions are implemented, but they do same thing (we can change candid to integrated it and delete updateSelectedCandid)
     */
    updateSelectedUsers(user) {
      if (
        !this.allSelected.map((u) => u.screen_name).includes(user.screen_name)
      ) {
        this.$store.commit('triage/addSelectedUser', user)
        this.$store.commit('triage/updateSelectedUserForComparison', user)
      } else {
        this.$store.commit('triage/removeSelectedUser', user)
        this.$store.commit('triage/resetSelectedUserForComparison')
      }
      // this.lastSelectedUser = user.screen_name
      // if (
      //   !this.allSelected
      //     .map((a) => a.screen_name.toLowerCase())
      //     .includes(user.screen_name.toLowerCase())
      // ) {
      //   this.$store.commit('triage/addSelectedUser', user.screen_name)
      //   // ToDo: add users profile when they are in the list
      // } else {
      //   this.$store.commit('triage/removeSelectedUser', user.screen_name)
      // }
    },
    removeSelected(user) {
      this.allSelected = this.allSelected.filter(function (ele) {
        return ele !== user
      })
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

.smooth-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
}
</style>
