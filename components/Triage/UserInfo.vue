<template>
  <v-card class="mx-auto" max-width="344" outlined>
    <div>
      <v-subheader>Selected Tweeters</v-subheader>
      <v-list shaped>
        <v-list-item-group color="primary">
          <v-list-item v-for="(username, i) in selectedList" :key="i">
            <v-list-item-icon>
              <v-btn
                icon
                color="grey"
                @click="(ev) => removeSelected.call({}, ev, username)"
                ><v-icon>mdi-account-remove</v-icon></v-btn
              >
              <v-btn
                icon
                :color="questionColor(username)"
                @click="(ev) => questionClicked.call({}, ev, username)"
                ><v-icon>mdi-account-question</v-icon></v-btn
              >
              <v-btn
                icon
                :color="searchColor(username)"
                @click="(ev) => searchClicked.call({}, ev, username)"
                ><v-icon>mdi-account-search</v-icon></v-btn
              >
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="username"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'UserInfo',
  components: {},
  props: {
    selectedList: {
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
    options: {
      type: Object,
      default() {
        return {
          tweetLimit: '10',
          chrome: 'transparent',
          dnt: 'true',
        }
      },
    },
  },
  data() {
    return {
      inspectList: [],
    }
  },
  computed: {
    questionColor(user) {
      return (user) => {
        if (this.inspectList.includes(user)) return 'orange'
        return 'grey'
      }
    },
    searchColor(user) {
      return (user) => {
        if (this.lastSelected === user) return 'blue'
        return 'grey'
      }
    },
  },
  methods: {
    questionClicked(ev, username) {
      if (!this.inspectList.includes(username)) this.inspectList.push(username)
      else {
        this.inspectList = this.inspectList.filter(function (ele) {
          return ele !== username
        })
      }
    },
    removeSelected(ev, username) {
      this.$emit('removeFromPile', username)
    },
    searchClicked(ev, username) {
      this.$emit('searchClicked', username)
    },
  },
}
</script>

<style scoped></style>
