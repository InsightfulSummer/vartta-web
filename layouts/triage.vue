<template>
  <v-app :light="!dark">
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" :clipped-right="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon>
          mdi-{{ `chevron-double-${miniVariant ? 'right' : 'left'}` }}
        </v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn icon disabled>
        <v-icon>mdi-network{{ disconnected ? '-off' : '' }}</v-icon>
      </v-btn>
      <v-btn icon @click.stop="dark = !dark">
        <v-icon>mdi-{{ `brightness-${dark ? '5' : '4'}` }}</v-icon>
      </v-btn>
      <v-btn icon @click.stop="rightMini = !rightMini">
        <v-icon>
          mdi-{{ `chevron-double-${rightMini ? 'left' : 'right'}` }}
        </v-icon>
      </v-btn>
    </v-app-bar>
    <v-content>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-content>
    <v-navigation-drawer
      v-model="rightDrawer"
      right
      clipped
      :mini-variant="rightMini"
      fixed
      app
    >
      <v-list-item
        v-for="user in selectedUsers"
        :key="user.screen_name"
        two-line
      >
        <v-list-item-avatar>
          <img :src="user.profile_image_url_https" />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ user.name }} @{{ user.screen_name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            <v-btn
              icon
              :color="
                selectedUserForComparison
                  ? selectedUserForComparison.screen_name === user.screen_name
                    ? 'green'
                    : 'grey'
                  : 'grey'
              "
              @click="(ev) => compareUser.call({}, ev, user)"
            >
              <v-icon>
                {{
                  selectedUserForComparison
                    ? selectedUserForComparison.screen_name === user.screen_name
                      ? 'mdi-sort-numeric-ascending'
                      : 'mdi-order-numeric-ascending'
                    : 'mdi-order-numeric-ascending'
                }}
              </v-icon>
            </v-btn>
            <v-btn
              icon
              color="blue"
              @click="(ev) => searchForUser.call({}, ev, user)"
            >
              <v-icon>mdi-account-search</v-icon>
            </v-btn>
            <v-btn
              icon
              color="warning"
              @click="(ev) => removeUser.call({}, ev, user)"
            >
              <v-icon>mdi-account-remove</v-icon>
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-navigation-drawer>
    <v-footer height="auto" app>
      <v-row justify="center">
        <v-btn
          v-for="link in items"
          :key="link.title"
          nuxt
          text
          rounded
          :to="link.to"
        >
          {{ link.title }}
        </v-btn>
        <!--        <v-flex primary lighten-2 py-1 text-xs-center white&#45;&#45;text xs12>-->
        <!--          <span class="caption">-->
        <!--            <strong>-->
        <!--              <a-->
        <!--                href="http://insight.uwo.ca"-->
        <!--                target="_blank"-->
        <!--                style="color: #fff6f9; text-decoration: none;"-->
        <!--              >-->
        <!--                Insight Lab @ Western </a-->
        <!--              >— </strong-->
        <!--            >&copy; {{ new Date().getFullYear() }}</span-->
        <!--          >-->
        <!--        </v-flex>-->
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
import socket from '../lib/socket.io'
export default {
  name: 'TriageLayout',
  data() {
    return {
      fluid: true,
      disconnected: socket.disconnected,
      clipped: true,
      drawer: false,
      fixed: false,
      miniVariant: true,
      rightDrawer: true,
      rightMini: true,
      title: 'VARTTA',
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/',
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Analytics',
          to: '/analytics',
        },
        {
          icon: 'mdi-view-dashboard',
          title: 'Compare',
          to: '/compare',
        },
        {
          icon: 'mdi-book-open',
          title: 'Shuffler',
          to: '/shuffler',
        },
        {
          icon: 'mdi-account-search',
          title: 'Triage',
          to: '/triage',
        },
        // {
        //   icon: 'mdi-badge-account-alert-outline',
        //   title: 'Triage-Step',
        //   to: '/triageStep',
        // },
      ],
      // Data required for connection metrics
      pingPong: {
        start: 0,
        end: 0,
        busy: false,
        history: [],
      },
    }
  },
  computed: {
    selectedUsers() {
      return this.$store.state.triage.selectedUsers
    },
    selectedUserForComparison() {
      return this.$store.state.triage.selectedUserForComparison
    },
    /*
     * Current delay in ms
     */
    delay() {
      if (this.pingPong.busy)
        if (this.pingPong.history.length > 0)
          return this.pingPong.history[this.pingPong.history.length - 1]
        else return 0
      return this.pingPong.end - this.pingPong.start
    },
    /*
     * Current average delay in ms
     */
    avgDelay() {
      let avg = 0
      for (const num of this.pingPong.history) avg += num
      avg = (10 * avg) / (this.pingPong.history.length * 10)
      return avg
    },
    dark: {
      get() {
        return this.$vuetify.theme.dark
      },
      set(val) {
        this.$vuetify.theme.dark = val
      },
    },
  },
  mounted() {
    this.rightMini = false
    const that = this
    window.setInterval(() => {
      if (socket.connected) {
        that.pingPong.busy = true
        that.pingPong.start = new Date().getTime()
        socket.emit('client_ping')
      }
    }, 2000)
    /*
     * Event handler for new connections.
     * The callback function is invoked when a connection with the server is established.
     */
    socket.on('connect', () => {
      this.disconnected = socket.disconnected
      socket.emit('client_event', { data: "I'm connected!" })
      // socket.emit('initial_data_request', {})
    })

    socket.on('reconnecting', (data) => {
      this.disconnected = socket.disconnected
    })

    /*
     * Event handler for server sent data.
     * The callback function is invoked whenever the server emits data
     * to the client. The data is then displayed in the "Received"
     * section of the page.
     */
    socket.on('server_response', (msg) => {
      // document.getElementById('log').innerText = msg.data
    })
    /*
     * Handler for the "pong" message. When the pong is received, the
     * time from the ping is stored, and the average of the last 30
     * samples is average and displayed.
     */
    socket.on('server_pong', () => {
      that.pingPong.end = new Date().getTime()
      that.pingPong.history.push(that.pingPong.end - that.pingPong.start)
      // Keep last 30 samples
      if (that.pingPong.history.length > 30) that.pingPong.history.splice(-30)
      that.pingPong.busy = false
    })
    /*
     * Store the incoming data
     */
    socket.on('bulk-update', (msg) => {
      that.commitUpdates(msg)
    })
  },
  methods: {
    commitUpdates(msg) {
      // Store the changes
      this.$store.commit('updateTopics', msg.topics)
      this.$store.commit('updateAggregatedTopics', msg.aggregatedTopics)
      this.$store.commit('updateAggregatedUsers', msg.aggregatedUsers)
      this.$store.commit('updateAggregatedKeywords', msg.aggregatedKeywords)
      this.$store.commit('addToRawTweets', msg.tweets)
      // this.$store.commit('addToRawTweets', msg.users)
    },
    removeUser(ev, user) {
      this.$store.commit('triage/removeSelectedUser', user.screen_name)
    },
    compareUser(ev, user) {
      this.$store.commit('triage/updateSelectedUserForComparison', user)
    },
    searchForUser(ev, user) {
      const col = document.getElementById('column-' + user.screen_name)
      if (col)
        col.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'start',
        })
    },
  },
}
</script>
