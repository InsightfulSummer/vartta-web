<template>
  <v-row justify="center" align="center">
    <v-col class="text-center" cols="12">
      <v-card flat color="transparent">
        <v-card-text>
          <h1 class="text-h4">Welcome to VARTTA</h1>
          <h2 class="text-h6">
            VARTTA: Visual Analytics for Real-Time Twitter datA. <br />
          </h2>
          <p>To start, please select one of the following scenarios.</p>
          <p>
            Citation:
            <a href="https://www.mdpi.com/2306-5729/5/1/20"
              >Haghighati, A.; Sedig, K. VARTTA: A Visual Analytics System for
              Making Sense of Real-Time Twitter Data. Data 2020, 5, 20.</a
            >
          </p>
          <h4>
            Please note that this is a work in progress. This version is under
            heavy developments :)
          </h4>
          <p>
            Find a bug? Please report it on the Github
            <a
              href="https://github.com/InsightfulSummer/vartta-web/issues"
              target="_blank"
              title="contribute"
              >issue board</a
            >.
          </p>
          <p>
            &copy;<a href="http://insight.uwo.ca">Insight Lab</a> at
            <a href="https://uwo.ca">Western</a>
          </p>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col v-for="(scenario, index) in scenarios" :key="index" cols="12" md="4">
      <v-hover>
        <v-card slot-scope="{ hover }" class="mx-auto" max-width="600">
          <v-img :aspect-ratio="16 / 9" :src="scenario.cloud">
            <div
              v-if="
                selectedScenario !== null && selectedScenario.id !== scenario.id
              "
              class="d-flex text-center transition-fast-in-fast-out grey darken-2 v-card--reveal--disconnected text-h2 white--text"
              style="height: 100%"
            >
              Another scenario is selected...
            </div>
            <div
              v-else-if="hover"
              :class="
                'd-flex text-xs-center transition-fast-in-fast-out darken-2 v-card--reveal display-3 white--text ' +
                scenario.color
              "
              style="height: 100%"
            >
              {{
                selectedScenario !== null
                  ? selectedScenario.id === scenario.id
                    ? 'Pause'
                    : 'Start'
                  : 'Start'
              }}
            </div>
          </v-img>
          <v-card-text class="pt-4" style="position: relative">
            <v-btn
              absolute
              :color="scenario.color"
              class="white--text"
              fab
              large
              right
              top
              :disabled="
                selectedScenario !== null && selectedScenario.id !== scenario.id
              "
              @click.stop="toggleConsuming(scenario)"
            >
              <v-icon>
                mdi-{{
                  selectedScenario !== null
                    ? selectedScenario.id === scenario.id
                      ? 'pause'
                      : 'power'
                    : 'power'
                }}
              </v-icon>
            </v-btn>
            <h3
              :class="
                'display-1 font-weight-light mb-2 ' + scenario.color + '--text'
              "
            >
              {{ scenario.title }}
            </h3>
            <div class="font-weight-light text-h6 mb-2">
              {{ scenario.subtitle }}
            </div>
          </v-card-text>
        </v-card>
      </v-hover>
    </v-col>
    <v-col cols="12" md="6">
      <v-hover>
        <v-card slot-scope="{ hover }" class="mx-auto" max-width="600">
          <v-img :aspect-ratio="16 / 9" src="">
            <div
              v-if="!hover"
              class="d-flex text-center transition-fast-in-fast-out v-card--reveal text-h2 white--text primary"
              style="height: 100%"
            >
              Custom Scenario
            </div>
            <div
              v-if="disconnected"
              class="d-flex text-center transition-fast-in-fast-out grey darken-2 v-card--reveal--disconnected text-h2 white--text"
              style="height: 100%"
            >
              Disconnected
            </div>
            <div
              v-else-if="selectedScenario && selectedScenario.id !== ''"
              class="d-flex text-center transition-fast-in-fast-out grey darken-2 v-card--reveal--disconnected text-h2 white--text"
              style="height: 100%"
            >
              Another scenario is selected...
            </div>
            <div
              v-else-if="hover"
              class="d-flex text-center transition-fast-in-fast-out darken-2 v-card--reveal text-h2 white--text primary"
              style="height: 100%"
            >
              Start
            </div>
          </v-img>
          <v-card-text class="pt-4" style="position: relative">
            <v-btn
              absolute
              color="warning"
              class="white--text"
              fab
              large
              right
              top
              :loading="disconnected"
              :disabled="
                disconnected || (selectedScenario && selectedScenario.id !== '')
              "
            >
              <v-icon>
                mdi-{{ suggestedScenario.consuming ? 'pause' : 'power' }}
              </v-icon>
            </v-btn>
            <v-dialog v-model="dialog" max-width="800px">
              <template #activator="{ on }">
                <v-btn
                  absolute
                  color="primary"
                  class="white--text"
                  fab
                  large
                  left
                  top
                  v-on="on"
                  @click.stop=""
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-title>Custom Scenario</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="suggestedScenario.title"
                        label="Scenario Name"
                        hint="A name for your scenario"
                        persistent-hint
                        @change="suggestedScenario.id = suggestedScenario.title"
                      ></v-text-field>
                      {{ suggestedScenario.id }}
                    </v-col>
                    <v-col cols="12">
                      <h5>Topics and Keywords</h5>
                      <v-btn
                        icon
                        color="indigo"
                        @click.stop="
                          suggestedScenario.topics.push({
                            id: '',
                            title: '',
                            keywords: [],
                          })
                        "
                      >
                        <v-icon>mdi-plus-circle</v-icon>
                      </v-btn>
                      # of Topics: {{ suggestedScenario.topics.length }}
                    </v-col>
                    <v-col
                      v-for="(topic, index) in suggestedScenario.topics"
                      :key="topic.id + index"
                      cols="12"
                    >
                      <v-row>
                        <v-col cols="1">
                          <v-btn
                            icon
                            color="red"
                            @click="suggestedScenario.topics.splice(index, 1)"
                          >
                            <v-icon>mdi-minus-circle</v-icon>
                          </v-btn>
                        </v-col>
                        <v-col cols="5">
                          <v-text-field
                            v-model="topic.title"
                            prepend-inner-icon="mdi-tag"
                            label="Topic Title"
                            @change="topic.id = topic.title"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6">
                          <v-combobox
                            v-model="topic.keywords"
                            label="Keywords"
                            chips
                            clearable
                            deletable-chips
                            multiple
                            prepend-inner-icon="mdi-pound"
                          >
                          </v-combobox>
                        </v-col>
                      </v-row>
                      <v-divider></v-divider>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="dialog = false">
                    Close
                  </v-btn>
                  <v-btn
                    color="blue darken-1"
                    text
                    :disabled="disconnected"
                    @click="toggleConsuming(suggestedScenario)"
                  >
                    Start
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <br />
            <h3 class="text-h4 font-weight-light mb-2 primary--text">
              {{ suggestedScenario.title }}
            </h3>
          </v-card-text>
        </v-card>
      </v-hover>
    </v-col>
  </v-row>
</template>

<script>
import socket from '../lib/socket.io'
export default {
  name: 'PageIndex',
  components: {},
  data() {
    return {
      disconnected: socket.disconnected,
      topics: null,
      dialog: false,
      suggestedScenario: {
        id: '',
        title: '',
        subtitle: '',
        custom: true,
        consuming: false,
        color: 'orange',
        topics: [
          {
            id: '',
            title: '',
            keywords: [],
          },
        ],
      },
      scenarios: [
        {
          id: 'phealth',
          title: 'Public Health',
          subtitle:
            'Causes of mortality, diseases, natural disasters, and more',
          color: 'orange',
          cloud: '/samples/phealth/cloud.png',
          custom: false,
        },
        {
          id: 'smartcity',
          title: 'Smart City / Urban Planning',
          subtitle: "Citizens' comments about urban spaces...",
          color: 'blue',
          cloud: '/samples/smartcity/cloud.png',
          custom: false,
        },
        {
          id: 'politics',
          title: 'U.S. Elections',
          subtitle: 'Debates about policies, political parties, and more',
          color: 'purple',
          cloud: '/samples/politics/cloud.png',
          custom: false,
        },
      ],
    }
  },
  computed: {
    selectedScenario: {
      set(val) {
        this.$store.commit('updateSelectedScenario', val)
      },
      get() {
        return this.$store.state.selectedScenario
      },
    },
  },
  beforeMount() {
    socket.on('reconnecting', (data) => {
      this.disconnected = socket.disconnected
    })
    socket.on('connect', (data) => {
      this.disconnected = socket.disconnected
    })
  },

  methods: {
    toggleConsuming(scenario) {
      // Was not already consuming streams or was consuming another stream
      if (this.selectedScenario === null) {
        this.$store.dispatch('reset')
        this.$store.dispatch('analytics/reset')
        this.$store.dispatch('compare/reset')
        this.$store.dispatch('shuffler/reset')
        this.$store.dispatch('triage/reset')
        this.$store.commit('updateSelectedScenario', scenario)
        if (scenario.custom) this.$store.commit('updateTopics', scenario.topics)
        else
          this.$store.dispatch('fetchData', {
            agtopics: '/api/samples/' + scenario.id + '/agtopics.json',
            agusers: '/api/samples/' + scenario.id + '/agusers.json',
            agkeywords: '/api/samples/' + scenario.id + '/agkeywords.json',
            tweets: '/api/samples/' + scenario.id + '/tweets.json',
            users: '/api/samples/' + scenario.id + '/users.json',
            topics: '/api/samples/' + scenario.id + '/topics.json',
            tfidf: '/api/samples/' + scenario.id + '/tfidf.json',
          })
        socket.emit('pause_consuming')
        socket.emit('update_channels', this.$store.state.topics)
        socket.emit('initial_data_request', {})
      } else {
        this.$store.dispatch('reset')
        this.$store.dispatch('analytics/reset')
        this.$store.dispatch('compare/reset')
        this.$store.dispatch('shuffler/reset')
        this.$store.dispatch('triage/reset')
        socket.emit('pause_consuming')
      }
    },
  },
}
</script>

<style scoped>
a {
  text-decoration: none !important;
}
.v-card--reveal--disconnected {
  align-items: center;
  bottom: 0;
  justify-content: center;
  opacity: 0.8;
  position: absolute;
  width: 100%;
}
.v-card--reveal {
  align-items: center;
  bottom: 0;
  justify-content: center;
  opacity: 0.5;
  position: absolute;
  width: 100%;
}
</style>
