export const state = () => ({
  topicsTreeSelections: [],
  treeViewOpenItems: [],
  minimizeTopics: false,
})

export const mutations = {
  resetTopicsTreeSelections(state) {
    state.topicsTreeSelections = []
  },
  resetTreeViewOpenItems(state) {
    state.treeViewOpenItems = []
  },
  resetMinimizeTopics(state) {
    state.minimizeTopics = false
  },
  updateTopicsTreeSelections(state, val) {
    state.topicsTreeSelections = val
  },
  updateMinimizeTopics(state, val) {
    state.minimizeTopics = val
  },
  updateTreeViewOpenItems(state, val) {
    state.treeViewOpenItems = val
  },
}

export const actions = {
  reset({ commit }) {
    commit('resetMinimizeTopics')
    commit('resetTopicsTreeSelections')
    commit('resetTreeViewOpenItems')
  },
}
