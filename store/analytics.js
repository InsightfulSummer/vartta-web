export const state = () => ({
  machineLearning: '',
  analysis: '',
  topic: null,
  user: { screen_name: '' },
})

export const mutations = {
  resetMachineLearning(state) {
    state.machineLearning = ''
  },
  resetAnalysis(state) {
    state.analysis = ''
  },
  resetTopic(state) {
    state.topic = null
  },
  resetUser(state) {
    state.user = { screen_name: '' }
  },
  updateMachineLearning(state, data) {
    state.machineLearning = data
  },
  updateAnalysis(state, data) {
    state.analysis = data
  },
  updateTopic(state, data) {
    state.topic = data
  },
  updateUser(state, data) {
    state.user = data
  },
}

export const actions = {
  reset({ commit }) {
    commit('resetAnalysis')
    commit('resetMachineLearning')
    commit('resetTopic')
    commit('resetUser')
  },
}
