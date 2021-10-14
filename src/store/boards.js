import {
  fbDB,
  collection,
  query,
  where,
  doc,
  getDoc,
  getDocs,
  onSnapshot
} from 'boot/firebase'

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
  setCurrentBoard(state, payload) {
    if (payload.board) {
      state.currentBoard = payload.board
    } else if (payload.slug) {
      state.currentBoard = state.boards.find(board => board.slug === payload.slug)
    }
  }
}

const actions = {
  async getAllBoards({commit, state, rootGetters}) {
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
              commit('updateBoard', {data, id})
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
    console.log(userId)
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
