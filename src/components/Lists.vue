<template>
  <div class="cards-wrapper q-mt-sm q-mx-sm">
    <q-card
      class="list-card draggable-list shadow-0"
      draggable="true"
      @dragstart.self="onListDragStart($event, list, index)"
      @dragend="onListDragEnd($event, list, index)"
      @dragenter.prevent="onListEnter($event, list)"
      @dragover.prevent
      @drop="onListDrop($event, index)"
      v-for="(list, index) in currentBoard.lists"
      :ref="el => listsRefs[index] = el"
    >
      <q-card-section class="card-title flex items-center">
        {{ list.name }}
        <q-space/>
        <q-btn class="btn-list-delete" icon="clear" @click="deleteList(list)" unelevated/>
      </q-card-section>

      <q-card-section class="list-content q-py-none q-px-sm">
        <q-card
          draggable="true"
          @dragstart.self="onCardDragStart($event, index, card, cardIndex)"
          @dragend="onCardDragEnd($event)"
          @dragenter.prevent
          @dragover.prevent="onCardDragOver($event, cardIndex)"
          v-for="(card,cardIndex) in list.cards"
          class="card shadow-1 draggable-card"
          :ref="el => cardsRefs[cardIndex] = el">
          <q-card-section class="card-content q-mb-sm">
            {{ card.name }}
          </q-card-section>
        </q-card>
        <cards draggable="true" @dragstart.prevent :list="list"/>
      </q-card-section>
    </q-card>

    <q-btn unelevated class="btn-add-list" label="Add new list" icon="add" @click="btnListMenu">
      <q-menu
        transition-show="none"
        transition-hide="none"
        no-refocus
        v-model="showMenu"
        fit anchor="top left" self="top left"
        style="box-shadow: none;"
      >
        <q-form no-reset-focus autofocus @submit="createList">
          <q-list class="add-list" dense>
            <q-item>
              <input
                v-model="listName"
                ref="addListInput"
                placeholder="Enter list title..."/>
            </q-item>
            <q-item>
              <q-btn class="btn-list-submit" dense unelevated color="primary" type="submit" label="Add list"/>
              <q-btn class="btn-list-cancel" dense unelevated text-color="grey-9" icon="close" v-close-popup/>
            </q-item>
          </q-list>
        </q-form>
      </q-menu>
    </q-btn>
  </div>
</template>

<script>
import {ref, reactive, computed} from "vue";
import {useStore} from "vuex";
import {v4 as uuidv4} from "uuid";

export default {
  setup() {
    const store = useStore()
    const addListInput = ref(null)
    const showMenu = ref(false)
    const listName = ref('')
    const listsRefs = ref([])
    const cardsRefs = ref([])

    let moveCard = reactive({
      content: {},
      index: 0,
      fromListIndex: 0,
      toListIndex: 0,
      targetCardIndex: 0
    })

    const currentBoard = computed(() => store.getters["boards/currentBoard"])

    return {
      btnListMenu: () => {
        setTimeout(function () {
          addListInput.value.focus();
        }, 50);
      },

      deleteList: (list) => {
        store.dispatch('lists/deleteList', list)
      },

      createList: () => {
        if (listName.value !== '') {
          store.dispatch('lists/addList', listName.value)

          const list = {
            id: uuidv4(),
            name: listName.value,
            cards: [],
          }

          /*
          const tempBoard = JSON.parse(JSON.stringify(currentBoard.value))
          tempBoard.lists.push(list)
           */

          /*  store.commit('boards/addList', list)
            store.dispatch('boards/updateBoard', {
              lists: currentBoard.value.lists,
              id: currentBoard.value.id
            })*/

          listName.value = ''
          showMenu.value = false
        } else {
          addListInput.value.focus();
        }
      },

      onListDragStart(event, list, index) {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.dropEffect = "move"
        event.dataTransfer.setData('elementPickedType', 'list')
        event.dataTransfer.setData('fromListIndex', index)
        const thisList = listsRefs.value[index].$el

        setTimeout(() => thisList.style.opacity = '0', 0)
      },

      onListDragEnd(event, list, index) {
        const thisList = listsRefs.value[index].$el
        thisList.style.opacity = '1'
      },

      onListEnter(event, list) {
        // if card is dropped over another list but not a card, put it at the bottom of the list
        moveCard.targetCardIndex = list.cards.length
      },

      onListDrop(event, index) {
        const elementPicked = event.dataTransfer.getData('elementPickedType')

        if (elementPicked === 'list') {
          const toListIndex = index
          const fromListIndex = event.dataTransfer.getData('fromListIndex')

          store.commit('boards/moveList', {
            fromListIndex: fromListIndex,
            toListIndex: toListIndex,
          })

          store.dispatch('boards/updateBoard', {
            lists: currentBoard.value.lists,
            id: currentBoard.value.id
          })

        } else if (elementPicked === 'card') {
          moveCard.toListIndex = index

          store.commit('boards/moveCard', {
            card: moveCard.content.value,
            cardIndex: moveCard.index,
            fromListIndex: moveCard.fromListIndex,
            toListIndex: moveCard.toListIndex,
            targetCardIndex: moveCard.targetCardIndex
          })

          store.dispatch('boards/updateBoard', {
            lists: currentBoard.value.lists,
            id: currentBoard.value.id
          })

          moveCard.value = {}
        }
      },

      onCardDragStart(event, listIndex, card, cardIndex) {
        event.dataTransfer.dropEffect = 'move'
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('elementPickedType', 'card')

        moveCard.fromListIndex = listIndex
        moveCard.content.value = card
        moveCard.index = cardIndex

        const thisCard = event.target

        setTimeout(() => thisCard.style.visibility = 'hidden', 0)
      },

      onCardDragEnd(event) {
        const thisCard = event.target
        thisCard.style.visibility = 'visible'
      },

      onCardDragOver(event, cardIndex) {
        // set the index of the card where the dragged card will be inserted
        moveCard.targetCardIndex = cardIndex
      },

      addListInput,
      listName,
      showMenu,
      currentBoard,
      listsRefs,
      cardsRefs,
      moveCard,
    }
  },
  components: {
    'cards': require('components/Cards').default
  }
}
</script>

<style lang="scss" scoped>
::v-deep(.btn-add-list) {
  align-items: start;
  font-weight: normal;
  text-transform: none;
  font-size: 1rem;
  width: 15rem;
  height: auto;
  background-color: #ffffff3d;
  color: $grey-2;
  border-radius: 3px;

  .on-left {
    font-size: 1.3rem;
    margin-right: 0.2rem;
  }
}

.cards-wrapper {
  display: flex;
  align-items: flex-start;
}

.add-list {
  padding: 0.3rem;
  background-color: $grey-3;

  & > :last-child {
    margin-top: 0.3rem;
  }

  .q-item {
    padding: 0;

    input {
      width: 100%;
      height: 2.2rem;
      padding-left: 0.6rem;
      box-shadow: inset 0 0 0 2px $primary;
      border-radius: 3px;
      border: none;
      outline: none;
    }

    .q-btn {
      height: 2rem;
      font-weight: normal;
      text-transform: none;
      font-size: 0.9rem;
      align-items: center;
    }

    .btn-list-submit {
      width: 4.5rem;
    }

    .btn-list-cancel {
      margin-left: 0.1rem;

      & :hover {
        background-color: transparent;
      }
    }
  }
}

.list-card {
  background-color: $blue-grey-1;
  color: $grey-9;
  width: 15rem;
  min-width: 15rem;
  min-height: 5.1rem;
  margin-right: 0.5rem;
  border-radius: 3px;
  font-weight: bold;

  &:hover {
    cursor: pointer;
  }

  .card-title {
    font-size: 1rem;
    padding-left: 0.9rem;
    padding-block: 0.3rem;
    padding-right: 0.4rem;

    .btn-list-delete {
      font-size: 0.8rem;
      width: 2rem;
    }
  }

  .list-content {
    .card-content {
      background-color: $grey-1;
      font-weight: normal;
      padding: 0.4rem;
      cursor: move;
      cursor: grab;

      &:hover {
        cursor: grab;
        background-color: $grey-3;
      }

      &:active {
        cursor: move;
        cursor: grabbing;
      }
    }
  }
}

.dragging {
}

</style>
