export const state = () => ({
  aggregatedTopics: {
    group_topics: [],
    theme_topics: [],
  },
  aggregatedKeywords: {
    themes: [],
    groups: [],
  },
  aggregatedUsers: [],
  topics: [],
  rawTweets: [],
  selectedScenario: null,
})

export const mutations = {
  resetAggregatedTopics(state) {
    state.aggregatedTopics = {
      group_topics: [],
      theme_topics: [],
    }
  },
  resetAggregatedKeywords(state) {
    state.aggregatedKeywords = {
      themes: [],
      groups: [],
    }
  },
  resetAggregatedUsers(state) {
    state.aggregatedUsers = []
  },
  resetTopics(state) {
    state.topics = []
  },
  resetRawTweets(state) {
    state.rawTweets = []
  },
  resetSelectedScenario(state) {
    state.selectedScenario = null
  },
  updateAggregatedTopics(state, data) {
    state.aggregatedTopics = data
  },
  updateAggregatedUsers(state, data) {
    state.aggregatedUsers = data
  },
  updateAggregatedKeywords(state, data) {
    state.aggregatedKeywords = data
  },
  updateTopics(state, data) {
    // Sort keywords
    for (const channel of data) {
      channel.keywords = channel.keywords.sort()
    }
    // Sort channels
    data = data.sort((a, b) => {
      return a.id > b.id ? 1 : -1
    })
    state.topics = data
  },
  updateSelectedTopic(state, data) {
    // If the topic already exists
    if (state.topics.includes((a) => a.id === data.channel))
      state.topics.find((a) => a.id === data.channel).keywords = data.keywords
    // otherwise
    else
      state.topics.push({
        id: data.channel.toLowerCase(),
        title: data.channel,
        keywords: data.keywords,
      })
  },
  updateRawTweets(state, data) {
    state.rawTweets = data
  },
  addToRawTweets(state, data) {
    state.rawTweets = [...state.rawTweets, ...data]
    // if (state.rawTweets.length > state.limit)
    //   state.rawTweets.splice(-state.limit)
  },
  updateSelectedScenario(state, scenario) {
    state.selectedScenario = scenario
  },
}

export const actions = {
  reset({ commit }) {
    commit('resetAggregatedKeywords')
    commit('resetAggregatedTopics')
    commit('resetAggregatedUsers')
    commit('resetRawTweets')
    commit('resetTopics')
    commit('resetSelectedScenario')
  },
  async fetchData({ commit, state }, routes) {
    const topics = await this.$http.$get(routes.topics)
    const agtopics = await this.$http.$get(routes.agtopics)
    const agusers = await this.$http.$get(routes.agusers)
    const agkeywords = await this.$http.$get(routes.agkeywords)
    const tweets = await this.$http.$get(routes.tweets)
    const users = await this.$http.$get(routes.users)
    const tfidf = await this.$http.$get(routes.tfidf)
    commit('updateTopics', topics)
    commit('updateAggregatedTopics', agtopics)
    commit('updateAggregatedUsers', agusers.a)
    commit('updateAggregatedKeywords', agkeywords)
    commit('addToRawTweets', tweets)
    commit('triage/updateUsers', users)
    commit('triage/updateTFIDF', tfidf)
  },
}
