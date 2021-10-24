import {
  fbAuth,
  fbDB,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  setDoc,
  getDoc,
  doc,
} from 'boot/firebase'

import {Notify} from "quasar";

const state = {
  userDetails: {},
  backgroundColors: [
    '#0078BD',
    '#00ADCC',
    '#838C91',
    '#51983A',
    '#4ABF6B',
    '#D28F32',
    '#AF4631',
    '#8A619E',
    '#CD5B92',
  ],

  labelColors: [
    '#61bd4f',
    '#51e898',
    '#f2d600',
    '#ff9f1a',
    '#eb5a46',
    '#c377e0',
    '#ff78cb',
    '#00c2e0',
    '#0078BD',
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
            message: 'Email is already registered!'
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

  handleAuthStateChanged({commit, dispatch}) {
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
          if (this.$router.currentRoute.value.name === 'auth') {
            await this.$router.push('/')
          }
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
        commit('boards/clearBoardsData', null, {root: true})
      }
    })
  },
}

const getters = {
  user: state => state.userDetails,
  backgroundColors: state => state.backgroundColors,
  labelColors: state => state.labelColors
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
