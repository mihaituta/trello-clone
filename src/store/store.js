import {
  fbApp,
  fbAuth,
  fbDB,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  collection,
  query,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  runTransaction,
  writeBatch,
  limit,
  where
} from 'boot/firebase'

import {Notify} from "quasar";

const state = {
  userDetails: {},
  loadingStatus: true,
  colors: [
    '#0078BD',
    '#00ADCC',
    '#D28F32',
    '#51983A',
    '#4ABF6B',
    '#AF4631',
    '#8A619E',
    '#CD5B92',
    '#838C91'
  ]
}

const mutations = {
  setUserDetails(state, payload) {
    state.userDetails = payload
  },
  clearData(state) {
    state.userDetails = null;
  }
}

const actions = {
  registerUser({}, payload) {
    createUserWithEmailAndPassword(fbAuth, payload.email, payload.password)
      .then((res) => {
        if (res) {
          const userId = fbAuth.currentUser.uid
          try {
            setDoc(doc(fbDB, "users", userId), {
              name: payload.name,
              email: payload.email,
            })
          } catch (err) {
            console.error("Error creating account: ", err)
          }
          Notify.create({
            progress: true,
            type: 'positive',
            color: 'secondary',
            timeout: 3000,
            position: 'top',
            message: 'User registered successfully!'
          })
        }
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          Notify.create({
            progress: true,
            type: 'negative',
            color: 'negative',
            timeout: 2000,
            position: 'top',
            message: 'Email is taken!'
          })
        }
      });
  },

  loginUser(state, payload) {
    signInWithEmailAndPassword(fbAuth, payload.email, payload.password)
      .then(async res => {
        if (res) {
          Notify.create({
            progress: true,
            type: 'positive',
            color: 'secondary',
            timeout: 2000,
            position: 'top',
            message: 'Login successfully!'
          })
        }
      })
      .catch(err => {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          Notify.create({
            progress: true,
            type: 'negative',
            color: 'negative',
            timeout: 2000,
            position: 'top',
            message: 'Invalid credentials!'
          })
        }
      })
  },

  async logoutUser({dispatch}) {

    await signOut(fbAuth).then(() => {
      // commit('setLoadingStatus', true)
      Notify.create({
        progress: true,
        type: 'positive',
        color: 'secondary',
        timeout: 2000,
        position: 'top',
        message: 'Logout successfully!'
      })
      // this unsubscribes from the listener so it doesn't throw error because of firebase rules trying to listen for changes when there is no user authenticated
      dispatch('boards/unsubBoardsListener', null, {root: true})
      // dispatch('lists/unsubListsListener', null, {root: true})
      // dispatch('cards/unsubCardsListener', null, {root: true})
    }).catch((err) => {
      console.log(err.message)
      Notify.create({
        progress: true,
        type: 'negative',
        color: 'negative',
        timeout: 2000,
        position: 'top',
        message: 'Something went wrong!'
      })
    });
  },

  handleAuthStateChanged({state, commit, dispatch}) {
    onAuthStateChanged(fbAuth, async user => {
      if (user) {
        // User is logged in
        try {
          const docSnap = await getDoc(doc(fbDB, "users", user.uid));
          const userDetails = docSnap.data()
          commit('setUserDetails', {
            name: userDetails.name,
            email: userDetails.email,
            userId: user.uid
          })
          dispatch('boards/getAllBoards', null, {root: true})
          dispatch('boards/boardsListener', null, {root: true})
        } catch (err) {
          console.log(err)
        }
        if (this.$router.currentRoute.value.name === 'auth') {
          await this.$router.push('/')
        }

      } else {
        // User is logged out
        await this.$router.replace('/auth')
        commit('clearData')
      }
    })
  },
}

const getters = {
  loadingStatus: state => state.loadingStatus,
  user: state => state.userDetails,
  colors: state => state.colors
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
