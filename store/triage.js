export const state = () => ({
  selectedUsers: [],
  users: [],
  TFIDF: {},
  selectedUserForComparison: null,
})

export const mutations = {
  resetSelectedUsers(state) {
    state.selectedUsers = []
  },
  resetUsers(state) {
    state.users = []
  },
  resetTFIDF(state) {
    state.TFIDF = {}
  },
  resetSelectedUserForComparison(state) {
    state.selectedUserForComparison = null
  },
  updateSelectedUsers(state, val) {
    state.selectedUsers = val
  },
  addSelectedUser(state, user) {
    if (
      !state.selectedUsers.map((a) => a.screen_name).includes(user.screen_name)
    )
      state.selectedUsers.push(user)
  },
  removeSelectedUser(state, username) {
    const index = state.selectedUsers
      .map((a) => a.screen_name)
      .indexOf(username)
    state.selectedUsers.splice(index, 1)
  },
  updateUsers(state, val) {
    state.users = val
  },
  updateTFIDF(state, val) {
    state.TFIDF = val
  },
  updateSelectedUserForComparison(state, val) {
    state.selectedUserForComparison = val
  },
}

export const actions = {
  reset({ commit }) {
    commit('resetSelectedUsers')
    commit('resetUsers')
    commit('resetTFIDF')
    commit('resetSelectedUserForComparison')
  },
}
