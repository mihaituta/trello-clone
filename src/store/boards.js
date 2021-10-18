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
  onSnapshot, orderBy
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
  addList(state, payload) {
    const board = state.boards.find(board => board.id === state.currentBoard.id)
    board.lists.push(payload)
  },
  addCard(state, payload) {
    const board = state.boards.find(board => board.id === state.currentBoard.id)
    const list = board.lists.find(list => list.id === payload.list_id)
    list.cards.push(payload.card)
  },
  moveCard(state, payload) {
    const board = state.boards.find(board => board.id === state.currentBoard.id)
    board.lists[payload.fromListIndex].cards.splice(payload.cardIndex, 1)
    board.lists[payload.toListIndex].cards.splice(payload.targetCardIndex, 0, payload.card)
  },
  moveList(state, payload) {
    const board = state.boards.find(board => board.id === state.currentBoard.id)
    const listToMove = board.lists.splice(payload.fromListIndex, 1)[0]
    board.lists.splice(payload.toListIndex, 0, listToMove)
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
    const boardsQuery = query(collection(fbDB, `users/${userId}/boards`), orderBy('date'));

    try {
      const snapshot = await getDocs(boardsQuery);
      const boards = []

      snapshot.forEach(doc => {
        let board = doc.data()
        const id = doc.id
        const temp = {
          id,
          name: board.name,
          slug: board.slug,
          color: board.color,
          lists: board.lists
        }
        boards.push(temp)
      });

      /* for (const board of boards) {
         const listsQuery = query(collection(fbDB, `users/${userId}/boards/${board.id}/lists`));
         const snapshot2 = await getDocs(listsQuery);

         const boardIndex = boards.findIndex(e => e.name === board.name)

         snapshot2.forEach(listDoc => {
           const list = listDoc.data()
           const id = listDoc.id
           const temp = {
             id,
             name: list.name,
             cards: []
           }
           // lists.unshift(temp)
           boards[boardIndex].lists.push(temp)
         })

         for (const list of boards[boardIndex].lists) {
           const cardsQuery = query(collection(fbDB, `users/${userId}/boards/${board.id}/lists/${list.id}/cards`));
           const snapshot = await getDocs(cardsQuery);
           snapshot.forEach(cardDoc => {
             const card = cardDoc.data()
             const id = cardDoc.id
             const temp = {
               id,
               name: card.name,
             }
             const listIndex = boards[boardIndex].lists.findIndex(e => e.name === list.name)
             boards[boardIndex].lists[listIndex].cards.push(temp)
           })
         }
       }*/

      commit('setBoards', boards)
      if (this.$router.currentRoute.value.name === 'board')
        commit('setCurrentBoard', {slug: this.$router.currentRoute.value.params.slug})
    } catch (e) {
      console.log(e.message)
    }
  },

  async boardsListener({commit, state, rootGetters}) {
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
              color: board.color,
              lists: board.lists
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

  async addBoard({rootGetters}, payload) {
    const userId = rootGetters['mainStore/user'].userId
    const slug = slugify(payload.name).toLowerCase()
    const boardsQuery = collection(fbDB, `users/${userId}/boards`);
    try {
      await addDoc(boardsQuery, {
        date: new Date().toISOString(),
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
    } else if (payload.color) {
      boardData = {
        color: payload.color,
      }
    } else if (payload.lists) {
      boardData = {
        lists: payload.lists
      }
    }

    try {
      await updateDoc(boardsQuery, boardData)
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
