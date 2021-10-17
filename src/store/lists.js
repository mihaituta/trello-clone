import {
  fbDB,
  setDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from 'boot/firebase'
import {v4 as uuidv4} from 'uuid';

const actions = {
  async addList({rootGetters}, payload) {
    const userId = rootGetters['mainStore/user'].userId
    const currentBoard = rootGetters['boards/currentBoard']
    const boardsQuery = doc(fbDB, `users/${userId}/boards`, currentBoard.id);

    try {
      await updateDoc(boardsQuery, {
        lists: arrayUnion({
          id: uuidv4(),
          name: payload,
          cards: [],
        })
      }, {merge: true})
    } catch (e) {
      console.log(e)
    }
  },

  async deleteList({rootGetters}, payload) {
    const userId = rootGetters['mainStore/user'].userId
    const currentBoard = rootGetters['boards/currentBoard']
    const boardsQuery = doc(fbDB, `users/${userId}/boards`, currentBoard.id);
    try {
      await updateDoc(boardsQuery, {
        lists: arrayRemove(payload)
      }, {merge: true})
    } catch (e) {
      console.log(e)
    }
  },
}

export default {
  namespaced: true,
  actions,
}
