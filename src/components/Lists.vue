<template>
  <div class="cards-wrapper q-mt-sm q-mx-sm">
    <q-card
      class="list-card draggable-list shadow-0"
      :draggable="canMoveList"
      @dragstart.self="onListDragStart($event, list, index)"
      @dragend="onListDragEnd($event, list, index)"
      @dragenter.prevent="onListEnter($event, list, index)"
      @dragover.prevent
      @drop="onListDrop($event, index)"
      @click="openListNameInput($event, index)"
      v-for="(list, index) in currentBoard.lists"
      :ref="el => listsRefs[index] = el"
    >
      <q-card-section class="list-title flex items-center no-wrap q-py-xs q-pl-sm relative-position">
        <textarea
          :ref="el => listNameInputsRef[index] = el"
          class="list-name-input"
          :value="list.name"
          @input="resizeTextArea($event.target)"
          rows="1"
          @blur="updateListName($event, list, index)"
          @keypress.enter="$event.target.blur()"
          @keyup.esc="closeListNameInput($event, list, index)"
          maxlength="100"
        />

        <q-btn class="btn-list-delete absolute-top-right" icon="more_horiz" unelevated>
          <menu-actions :list="list" :listIndex="index" element="list"/>
        </q-btn>
      </q-card-section>

      <q-card-section class="list-content q-py-none q-px-sm">
        <q-card
          draggable="true"
          @click="openCardModal(card, index, cardIndex)"
          @dragstart.self="onCardDragStart($event, index, card, cardIndex)"
          @dragend="onCardDragEnd($event)"
          @dragenter.prevent
          @dragover.prevent="onCardDragOver($event, cardIndex)"
          v-for="(card, cardIndex) in list.cards"
          class="shadow-1"
          :ref="el => cardsRefs[cardIndex] = el">

          <q-card-section class="card-content column">
            <span v-if="list.labelColor"
                  v-bind:style="{backgroundColor: list.labelColor}"
                  class="card-label"/>

            <span class="card-title">{{ card.name }}</span>

            <div v-if="card.checkboxes && card.checkboxes.length > 0" class="checklist flex"
                 v-bind:style="{backgroundColor: card.checklistCompleted ? '#61bd4f' : ''}">
              <q-icon
                v-bind:style="{color: card.checklistCompleted ? 'white' : ''}"
                name="o_check_box"/>
              <span
                v-bind:style="{color: card.checklistCompleted ? 'white' : ''}"
                class="checklist-numbers">{{ checklistStatus(card) }}</span>
            </div>

          </q-card-section>

        </q-card>
        <create-card draggable="true" @dragstart.prevent :list="list"/>
      </q-card-section>
    </q-card>

    <card-modal :card="updateCardData"
                :showModal="showCardModal"
                @closeCardModal="closeCardModal($event)"/>
    <q-btn unelevated class="btn-add-list" label="Add new list" icon="add" @click="openAddListMenu">
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

export default {
  setup() {
    const store = useStore()
    const addListInput = ref(null)
    const showMenu = ref(false)
    const listName = ref('')
    const listsRefs = ref([])
    const cardsRefs = ref([])
    const listNameInputsRef = ref([])
    let canOpenListNameInput = ref([])
    let canMoveList = ref(true)
    let showCardModal = ref(false)
    let updateCardData = ref({})

    let moveCard = reactive({
      content: {},
      index: 0,
      fromListIndex: 0,
      toListIndex: 0,
      targetCardIndex: undefined
    })

    const currentBoard = computed(() => {
      listNameInputsRef.value.forEach(input => {
        if (input) resizeTextArea(input)
      })
      return store.getters["boards/currentBoard"]
    })

    const resizeTextArea = (input) => {
      input.style.height = "auto";
      input.style.height = input.scrollHeight + "px";
    }

    return {
      checklistStatus: (card) => {
        const checked = computed(() => card.checkboxes.filter(item => item.checked === true))
        return (checked.value.length + '/' + card.checkboxes.length)
      },

      // open the list name input update only on @mouseup event so when the user clicks(holds) and moves the card the input does not open
      openListNameInput: (event, index) => {
        const thisInput = listNameInputsRef.value[index]
        if (event.target.contains(thisInput)) {
          canMoveList.value = false
          // reset pointer events so the text can be selected
          thisInput.style.pointerEvents = 'auto'
          setTimeout(() => listNameInputsRef.value[index].focus(), 0)
        }
      },

      // reset the name input if escape key is pressed
      closeListNameInput: (event, list, index) => {
        listNameInputsRef.value[index].value = list.name
        canMoveList.value = true
        return event.target.blur()
      },

      updateListName: (event, list, index) => {
        let thisInput = listNameInputsRef.value[index]
        if (thisInput.value === '') {
          thisInput.value = list.name
        } else if (thisInput.value !== list.name) {
          store.commit('boards/updateList', {
            index,
            list: {
              ...list,
              name: thisInput.value
            }
          })

          store.dispatch('boards/updateBoard', {
            lists: currentBoard.value.lists,
            id: currentBoard.value.id
          })
        }

        // remove pointer events when updating title so the list can be moved when clicked and dragged on the title
        thisInput.style.pointerEvents = 'none'
        resizeTextArea(thisInput)
        canMoveList.value = true
      },

      openAddListMenu: () => {
        setTimeout(() => addListInput.value.focus(), 50)
      },

      createList: () => {
        if (listName.value !== '') {
          store.dispatch('lists/addList', listName.value)
          listName.value = ''
          showMenu.value = false
        } else {
          addListInput.value.focus();
        }
      },

      openCardModal: (card, listIndex, cardIndex) => {
        updateCardData.value = {
          content: {...card},
          cardIndex: cardIndex,
          listIndex: listIndex
        }
        showCardModal.value = true
      },

      closeCardModal: () => {
        showCardModal.value = false
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

      onListEnter(event, list, targetListIndex) {
        // if a card is dropped over another list but not over a card, place it at the bottom of that list
        if (moveCard.fromListIndex !== targetListIndex)
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

          if (moveCard.targetCardIndex !== undefined) {
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
          }

          moveCard = {
            content: {},
            index: 0,
            fromListIndex: 0,
            toListIndex: 0,
            targetCardIndex: undefined
          }
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
        event.target.style.visibility = 'visible'
      },

      onCardDragOver(event, cardIndex) {
        // set the index of the card where the dragged card will be inserted
        moveCard.targetCardIndex = cardIndex
      },

      updateCardData,
      showCardModal,
      resizeTextArea,
      canMoveList,
      canOpenListNameInput,
      listNameInputsRef,
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
    'create-card': require('components/CreateCard').default,
    'menu-actions': require('components/MenuActions').default,
    'card-modal': require('components/CardModal').default
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

  ::v-deep(.list-title) {
    font-size: 1rem;
    padding-right: 2.1rem;

    .list-name-input {
      padding-left: 0.4rem;
      padding-block: 0.3rem;
      padding-right: 0.4rem;
      pointer-events: none;
      cursor: pointer;
      width: 100%;
      color: $grey-9;
      font-weight: bold;
      background-color: transparent;
      border: none;
      outline: none;
      word-wrap: break-word;
      resize: none;
      overflow: hidden;
      height: fit-content;

      &:focus {
        box-shadow: inset 0 0 0 2px $primary;
        border-radius: 3px;
        border: none;
        outline: none;
        color: $blue-grey-9;
        background-color: white;
        cursor: text;
      }
    }

    .btn-list-delete {
      font-size: 0.8rem;
      width: 2rem;
      right: 0.2rem;
      top: 0.3rem;
    }
  }

  .list-content {
    .card-content {
      background-color: $grey-1;
      font-weight: normal;
      padding-inline: 0.4rem;
      padding-bottom: 0.125rem;
      padding-top: 0.375rem;
      margin-bottom: 0.5rem;
      cursor: pointer;

      &:hover {
        background-color: $grey-3;
      }

      &:active {
        cursor: move;
        cursor: grabbing;
      }

      .card-label {
        min-height: 0.5rem;
        min-width: 2.5rem;
        width: 2.5rem;
        border-radius: 0.25rem;
        margin-bottom: 0.3rem;
        margin-top: 0.1rem;
      }

      .card-title {
        word-break: break-word;
        font-size: 0.85rem;
        padding: 0;
        margin-bottom: 0.25rem;
      }

      .checklist {
        padding: 0.3rem 0.4rem 0.1rem 0.3rem;
        margin-bottom: 0.3rem;
        width: fit-content;
        border-radius: 3px;
        color: $grey-8;
        font-weight: bold;

        .q-icon {
          font-size: 0.9rem;
        }

        .checklist-numbers {
          padding-left: 0.3rem;
          font-size: 0.7rem;
        }
      }
    }
  }
}

</style>
