import {
  fbDB,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove, setDoc,
} from 'boot/firebase'
import {v4 as uuidv4} from 'uuid';

const actions = {
  async createCard({rootGetters}, payload) {
    const userId = rootGetters['mainStore/user'].userId
    const currentBoard = rootGetters['boards/currentBoard']
    const boardsQuery = doc(fbDB, `users/${userId}/boards`, currentBoard.id);

    try {
      await updateDoc(boardsQuery, {

        /*   'lists.0': {
             cards: arrayUnion({
               id: uuidv4(),
               name: payload.card,
             }),
             name: payload.list.name,
             id: payload.list.id
           }*/

        [`lists.${0}.cards`]: arrayUnion({
          id: uuidv4(),
          name: payload.card,
        }),
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

  /*  async updateList({rootGetters}, payload) {
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
    }*/
}

export default {
  namespaced: true,
  actions,
}
