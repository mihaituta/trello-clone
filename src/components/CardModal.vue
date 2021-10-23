<template>
  <q-dialog
    @hide="onClose"
    transition-duration="100"
    @show="onShow"
    v-model="showModal">
    <q-card class="card-wrapper text-blue-grey-8">
      <q-card-section class="title-wrapper relative-position">
        <q-icon name="o_feed" size="sm" class="absolute"/>
        <textarea
          ref="cardNameInput"
          class="card-name-input"
          :value="currentCard.name"
          @input="resizeTextArea($event.target)"
          rows="1"
          @blur="updateCardName($event)"
          @keypress.enter="$event.target.blur()"
          @keyup.esc.stop="closeCardNameInput($event)"
          maxlength="100"
        />
        <!--        <q-input
                  ref="cardNameInput"
                  class="card-name-input"
                  :model-value="currentCard.name"
                  @update:model-value="update($event)"
                  @blur="updateCardName($event)"
                  @keypress.enter="$event.target.blur()"
                  @keyup.esc.stop="closeCardNameInput($event)"
                  dense
                  borderless
                  autogrow
                  maxlength="100"
                />-->

      </q-card-section>

      <q-btn class="absolute-top-right btn-close-modal" round flat icon="close" v-close-popup/>
      <q-btn class="absolute-top-right btn-delete-card" round flat icon="o_delete" @click="showDeleteModal = true"/>

      <q-card-section class="content column">
        <div class="description-wrapper text-weight-bold">
          <div class="description-title relative-position">
            <q-icon name="subject" size="sm" class="absolute"/>
            <div class="description-title">Description</div>
          </div>
          <textarea class="" rows="3"></textarea>
        </div>

        <div class="checklist-wrapper text-weight-bold">
          <div class="checklist-title-wrapper relative-position">
            <q-icon name="o_check_box" size="sm" class="absolute"/>
            <div class="checklist-title">Checklist</div>
          </div>

          <div class="progress-bar-wrapper relative-position">
            <span class="progress-bar-label absolute">{{ progressBar * 100 }}%</span>
            <q-linear-progress :value="progressBar" class="q-my-sm progress-bar" rounded size="0.4rem"/>
          </div>

          <div v-if="currentCard.checkboxes" class="column">
            <q-checkbox
              class="checkbox items-center relative-position"
              dense
              v-for="(checkbox, index) in checkboxes"
              :model-value="checkbox.checked"
              @update:model-value="updateCard(index)"
            >
              <div @click.stop class="checkbox-label">{{ checkbox.name }}</div>
              <q-btn
                class="absolute-right btn-delete" dense
                @click.stop="deleteCheckbox(index)" flat icon="o_delete"/>
            </q-checkbox>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <delete-modal
      :showModal="showDeleteModal"
      :listIndex="card.listIndex"
      :cardIndex="card.cardIndex"
      element="card"
      @closeDeleteModal="closeDeleteModal($event)"
      @deleteCard="deleteCard($event)"/>
  </q-dialog>
</template>

<script>
import {computed, ref} from 'vue'
import {useStore} from "vuex";

export default {
  props: {
    showModal: {
      type: Boolean
    },
    card: {
      type: Object
    }
  },
  emits: ['closeCardModal'],

  setup(props, {emit}) {
    const store = useStore()
    const currentBoard = computed(() => store.getters["boards/currentBoard"])
    let showDeleteModal = ref(false)
    const currentCard = computed(() => currentBoard.value.lists[props.card.listIndex].cards[props.card.cardIndex])
    let checkboxes = computed(() => JSON.parse(JSON.stringify(currentCard.value.checkboxes)))
    const cardNameInput = ref(null)
    let tempName = ref('')
    //checkboxes that have been checked
    const checked = computed(() => {
      if (currentCard.value.checkboxes) {
        return currentCard.value.checkboxes.filter(item => item.checked === true)
      }
    })

    const resizeTextArea = (input) => {
      input.style.height = "auto";
      input.style.height = input.scrollHeight + "px";
    }


    return {
      tempName,
      updateCard: (index) => {
        let checkbox = checkboxes.value[index]

        checkbox.checked = !checkbox.checked

        const checked = checkboxes.value.filter(item => item.checked === true)

        store.commit('boards/updateCard', {
          ...props.card.content,
          listIndex: props.card.listIndex,
          cardIndex: props.card.cardIndex,
          checkboxIndex: index,
          // checked: checkbox.checked,
          checkboxes: checkboxes.value,
          checklistCompleted: checkboxes.value.length === checked.length
        })

        store.dispatch('boards/updateBoard', {
          lists: currentBoard.value.lists,
          id: currentBoard.value.id
        })
      },

      update: (event) => {
        tempName.value = event
      },

      updateCardName: (event) => {
        // let thisInput = tempName
        let thisInput = event.target

        if (thisInput.value === '') {
          thisInput.value = currentCard.value.name
        } else if (thisInput.value !== currentCard.value.name) {
          store.commit('boards/updateCard', {
            ...props.card.content,
            name: thisInput.value,
            listIndex: props.card.listIndex,
            cardIndex: props.card.cardIndex,
          })

          store.dispatch('boards/updateBoard', {
            lists: currentBoard.value.lists,
            id: currentBoard.value.id
          })
        }

        resizeTextArea(thisInput)
      },

      // reset the name input if escape key is pressed
      closeCardNameInput: (event) => {
        event.target.value = currentCard.value.name
        // tempName.value = currentCard.value.name
        return event.target.blur()
      },

      deleteCheckbox: (index) => {
        const checked = checkboxes.value.filter(item => item.checked === true)

        store.commit('boards/updateCard', {
          listIndex: props.card.listIndex,
          cardIndex: props.card.cardIndex,
          checkboxIndexToDelete: index,
          checklistCompleted: checkboxes.value.length === checked.length
        })

        store.dispatch('boards/updateBoard', {
          lists: currentBoard.value.lists,
          id: currentBoard.value.id
        })
      },

      progressBar: computed(() => {
        if (currentCard.value.checkboxes) {
          const value = Math.round(checked.value.length / checkboxes.value.length * 100) / 100
          return checked.value.length === 0 ? 0 : value
        }

        return 0
      }),

      onClose: () => emit('closeCardModal'),

      onShow: () => {
        resizeTextArea(cardNameInput.value)
      },

      deleteCard: () => {
        store.commit('boards/deleteCard', {
          listIndex: props.card.listIndex,
          cardIndex: props.card.cardIndex
        })

        store.dispatch('boards/updateBoard', {
          lists: currentBoard.value.lists,
          id: currentBoard.value.id
        })

        showDeleteModal.value = false
        emit('closeCardModal')
      },

      closeDeleteModal: () => showDeleteModal.value = false,

      cardNameInput,
      checked,
      checkboxes,
      currentCard,
      showDeleteModal,
      resizeTextArea
    }
  },
  components: {
    'delete-modal': require('components/DeleteModal').default
  }
}
</script>

<style lang="scss" scoped>
.card-wrapper {
  min-width: 500px;
  padding-inline: 0.8rem;
  font-size: 1rem;

  /*  .btn-delete-card {
      right: 2.5rem;
      font-size: 0.8rem;
      top: 1px;
    }*/

  .btn-delete-card {
    right: 2.5rem;
    font-size: 0.8rem;
    top: 0.2rem;
  }

  .btn-close-modal {
    font-size: 0.9rem;
    top: 0.1rem;
  }

  .q-icon {
    left: -2.5rem;
  }

  .title-wrapper {
    font-size: 1rem;
    margin-left: 2rem;
    padding-inline: 0;
    padding-top: 0.8rem;
    padding-bottom: 1rem;

    .q-icon {
      top: 1.25rem;
      left: -2rem;
    }

    .card-name-input {
      padding-left: 0.5rem;
      padding-block: 0.3rem;
      padding-right: 0.5rem;
      cursor: pointer;
      width: 23rem;
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

    /* ::v-deep(.card-name-input) {
       textarea {
         font-size: 1rem;
         padding-inline: 0.5rem;
         cursor: pointer;
         width: 23rem;
         color: $blue-grey-8;
         font-weight: bold;
         background-color: transparent;
         border: none;
         outline: none;
         word-wrap: break-word;
         resize: none;
         overflow: hidden;

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
     }*/
  }

  .content {
    padding-top: 0;
    padding-inline: 0;

    .description-wrapper {
      padding-inline: 0;
      padding-left: 2.5rem;

      .description-title {
        margin-bottom: 0.8rem;
      }

      .q-icon {
        top: -0.05rem;
      }
    }

    .checklist-wrapper {

      .checklist-title-wrapper {
        margin-block: 1rem;
        padding-left: 2.5rem;

        .q-icon {
          left: 0;
        }
      }

      .progress-bar-label {
        color: black;
        font-size: 0.7rem;
        font-weight: normal;
        top: -0.3rem;
        left: 0.2rem;
      }

      .progress-bar {
        margin-left: 2.55rem;
        width: 27rem;
      }

      ::v-deep(.checkbox) {
        margin-top: 0.8rem;
        margin-left: 1px;
        font-size: 1rem;
        margin-block: 0.5rem;

        .q-checkbox__label {
          font-size: 0.9rem;
          width: 100%;
          margin-left: 1rem;
          padding-left: 0.1rem;

          span {
            width: 100%;
          }
        }

        //if checkbox is checked draw a line through the text
        .q-checkbox__inner--truthy ~ .q-checkbox__label > div {
          text-decoration: line-through;
        }

        .btn-delete {
          color: $blue-grey-7;
          top: -0.2rem;
          right: -0.3rem;
          font-size: 0.8rem;
        }
      }
    }
  }
}
</style>
