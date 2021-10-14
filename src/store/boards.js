import {
  fbDB,
  collection,
  query,
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
    state.currentBoard = payload
  }
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
      await commit('setBoards', boards)
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

  /*  setCurrentBoard({commit}) {

    },*/

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
