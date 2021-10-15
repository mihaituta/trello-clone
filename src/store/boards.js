import {
  fbDB,
  collection,
  query,
  where,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot
} from 'boot/firebase'
import {Notify} from 'quasar'

const slugify = require('slugify')

const state = {
  currentBoard: {},
  boards: [],
  boardsListener: null
}

const mutations = {
  setBoardsListener(state, payload) {
    state.boardsListener = payload
  },
  setBoards(state, payload) {
    state.boards = payload;
  },
  addBoard(state, payload) {
    state.boards.push(payload)
  },
  updateBoard(state, payload) {
    // find the board in array and replace it with the new one
    state.boards = [...state.boards.map(item => item.id !== payload.id ? item : {...item, ...payload})]
  },
  deleteBoard(state, board_id) {
    const boardToDelete = state.boards.findIndex(item => item.id === board_id);
    state.boards.splice(boardToDelete, 1)
  },
  setCurrentBoard(state, payload) {
    if (payload.board) {
      state.currentBoard = payload.board
    } else if (payload.slug) {
      state.currentBoard = state.boards.find(board => board.slug === payload.slug)
    }
  },
}

const actions = {
  async getAllBoards({commit, rootGetters}) {
    const userId = rootGetters['mainStore/user'].userId
    const boardsQuery = query(collection(fbDB, `users/${userId}/boards`));
    try {
      const snapshot = await getDocs(boardsQuery);
      const boards = []
      await snapshot.forEach(doc => {
        let board = doc.data()
        const id = doc.id
        const temp = {
          id,
          name: board.name,
          slug: board.slug,
          color: board.color,
        }
        boards.unshift(temp)
      });
      commit('setBoards', boards)
      if (this.$router.currentRoute.value.name === 'board')
        commit('setCurrentBoard', {slug: this.$router.currentRoute.value.params.slug})
    } catch (e) {
      console.log(e.message)
    }
  },

  async boardsListener({commit, rootGetters}) {
    const userId = rootGetters['mainStore/user'].userId
    const boardsQuery = query(collection(fbDB, `users/${userId}/boards`));
    let initState = true
    const boardsListener = onSnapshot(boardsQuery, snapshot => {
      if (initState) {
        initState = false;
      } else {
        if (!snapshot.docChanges().empty) {
          snapshot.docChanges().forEach(change => {
            let board = change.doc.data()
            const id = change.doc.id
            const data = {
              id,
              name: board.name,
              slug: board.slug,
              color: board.color
            }
            if (change.type === 'added') {
              commit('addBoard', data)
            } else if (change.type === 'modified') {
              commit('updateBoard', data)
              commit('setCurrentBoard', {board: data})
            } else if (change.type === 'removed') {
              commit('deleteBoard', id);
            }
          });
        }
      }
    });
    commit('setBoardsListener', boardsListener)
  },

  async getCurrentBoard({state, commit, rootGetters}, payload) {
    const userId = rootGetters['mainStore/user'].userId
    const boardQuery = query(collection(fbDB, `users/${userId}/boards`), where('slug', '==', payload));

    const docSnap = await getDoc(boardQuery);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      commit('setCurrentBoard', docSnap.data())
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  },

  async addBoard({rootGetters}, payload) {
    const userId = rootGetters['mainStore/user'].userId
    const slug = slugify(payload.name).toLowerCase()
    const boardsQuery = collection(fbDB, `users/${userId}/boards`);
    try {
      await addDoc(boardsQuery, {
        name: payload.name,
        color: payload.color,
        slug
      })
      Notify.create({
        progress: true,
        type: 'positive',
        color: 'secondary',
        timeout: 2000,
        position: 'top',
        message: 'Board added successfully!'
      })
    } catch (e) {
      console.log(e)
      return e
    }
  },

  async updateBoard({rootGetters}, payload) {
    const userId = rootGetters['mainStore/user'].userId
    const boardsQuery = doc(fbDB, `users/${userId}/boards`, payload.id);

    let boardData = {}

    if (payload.name) {
      boardData = {
        name: payload.name,
        slug: slugify(payload.name).toLowerCase()
      }
    } else {
      boardData = {
        color: payload.color,
      }
    }

    try {
      //if board does not exist, add it
      await updateDoc(boardsQuery, boardData)

      Notify.create({
        progress: true,
        type: 'positive',
        color: 'secondary',
        timeout: 2000,
        position: 'top',
        message: 'Board updated successfully!'
      })

    } catch (e) {
      console.log(e)
      return e
    }
  },

  async deleteBoard({rootGetters}, payload) {
    const userId = rootGetters['mainStore/user'].userId
    const boardsQuery = doc(fbDB, `users/${userId}/boards`, payload);
    try {
      deleteDoc(boardsQuery)
      Notify.create({
        progress: true,
        type: 'positive',
        color: 'secondary',
        timeout: 2000,
        position: 'top',
        message: 'Board deleted successfully!'
      })
      await this.$router.replace('/')
    } catch (e) {
      console.log(e)
    }
  },

  unsubBoardsListener({state}) {
    state.boardsListener()
  }
}

const getters = {
  boards: state => state.boards,
  currentBoard: state => state.currentBoard
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
