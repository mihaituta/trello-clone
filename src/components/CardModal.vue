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
          class="card-name-input card-textarea"
          :value="currentCard.name"
          @input="resizeTextArea($event.target)"
          rows="1"
          @blur="updateCardName($event)"
          @keypress.enter="$event.target.blur()"
          @keyup.esc.stop="closeCardNameInput($event)"
          maxlength="100"
        />
      </q-card-section>

      <q-btn class="absolute-top-right btn-close-modal" round flat icon="close" v-close-popup/>
      <q-btn class="absolute-top-right btn-delete-card" round flat icon="o_delete" @click="showDeleteModal = true"/>

      <q-card-section class="content column">
        <div class="description-wrapper text-weight-bold">
          <div class="description-title relative-position">
            <q-icon name="subject" size="sm" class="absolute"/>
            <div class="description-title">Description</div>
          </div>

          <textarea
            placeholder="Add a more detailed description..."
            ref="cardDescriptionInput"
            class="card-description-input card-textarea"
            :value="currentCard.description"
            @input="resizeTextArea($event.target)"
            rows="1"
            @blur="updateCardDescription($event)"
            @keypress.enter="$event.target.blur()"
            @keyup.esc.stop="closeCardDescriptionInput($event)"
            maxlength="1024"
          />
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
            <div v-for="(checkbox, index) in checkboxes" class="checkbox-wrapper flex items-center no-wrap">
              <input
                type="checkbox"
                class="checkbox"
                :checked="checkbox.checked"
                :aria-checked="checkbox.checked"
                @change="toggleCardCheckbox(index)"
              />
              <textarea
                :ref="el => checkboxNameInputs[index] = el"
                class="card-checkbox-input card-textarea"
                :value="checkbox.name"
                @input="resizeTextArea($event.target, index)"
                rows="1"
                @blur="updateCheckboxName($event, index)"
                @keyup.esc.stop="closeCheckboxNameInput($event, index)"
                @keypress.enter="$event.target.blur()"
                @click.stop
                maxlength="100"
              />
              <q-btn class=" btn-delete" dense
                     @click.stop="deleteCheckbox(index)" flat icon="o_delete"/>
            </div>

          </div>
          <div class="add-checkbox-wrapper">
            <q-btn v-if="!showAddMenu" dense unelevated class="btn-add-checkbox q-mb-sm" label="Add a checkbox"
                   @click.stop="showAddMenu = true"/>
            <div
              v-else
              class="add-checkbox-menu"
              @focusout="closeAddCheckboxMenu"
            >
              <q-form @submit.stop="createCheckbox">
                <q-input
                  ref="addCheckboxInput"
                  autofocus
                  borderless
                  class="add-checkbox-input"
                  autogrow
                  rows="1"
                  v-model="checkboxName"
                  type="textarea"
                  @keydown.enter="createCheckbox"
                  @keyup.esc.stop="closeAddCheckboxMenu"
                  placeholder="Add a checkbox..."
                  maxlength="100"
                />

                <div class="q-mt-xs">
                  <q-btn class="btn-checkbox-actions btn-checkbox-submit" dense unelevated color="primary" type="submit"
                         label="Add checkbox"/>
                  <q-btn class="btn-checkbox-actions btn-checkbox-cancel" dense unelevated text-color="grey-9"
                         icon="close"
                         @click.stop="closeAddCheckboxMenu"/>
                </div>
              </q-form>
            </div>
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
import {computed, ref, watch} from 'vue'
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
    const showDeleteModal = ref(false)
    const currentCard = computed(() => currentBoard.value.lists[props.card.listIndex].cards[props.card.cardIndex])
    let checkboxes = computed(() => JSON.parse(JSON.stringify(currentCard.value.checkboxes)))
    const cardNameInput = ref(null)
    const cardDescriptionInput = ref(null)
    let checkboxNameInputs = ref([])
    const showAddMenu = ref(false)
    const checkboxName = ref('')
    const addCheckboxInput = ref(null)

    //checkboxes that have been checked
    const checked = computed(() => {
      if (currentCard.value.checkboxes)
        return currentCard.value.checkboxes.filter(item => item.checked === true)
    })

    const resizeTextArea = (input) => {
      input.style.height = "auto";
      input.style.height = input.scrollHeight + "px";
    }

    // watch the checkbox refs array and resize height when value changes
    watch(checkboxNameInputs.value, inputs => {
      inputs.forEach(input => {
        if (input) resizeTextArea(input)
      })
    })

    return {
      // name
      updateCardName: (event) => {
        let thisInput = event.target

        if (thisInput.value === '') {
          thisInput.value = currentCard.value.name
        } else if (thisInput.value !== currentCard.value.name) {
          store.commit('boards/updateCard', {
            ...currentCard.value,
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
      closeCardNameInput: (event) => {
        event.target.value = currentCard.value.name
        return event.target.blur()
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

      // description
      updateCardDescription: (event) => {
        const thisInput = event.target

        //if the description is only white spaces set it back to '' no value to display placeholder text
        if (thisInput.value.length > 0 && thisInput.value.trim() === '')
          thisInput.value = ''

        store.commit('boards/updateCard', {
          ...currentCard.value,
          description: thisInput.value,
          listIndex: props.card.listIndex,
          cardIndex: props.card.cardIndex,
        })

        store.dispatch('boards/updateBoard', {
          lists: currentBoard.value.lists,
          id: currentBoard.value.id
        })

        resizeTextArea(thisInput)
      },
      closeCardDescriptionInput: (event) => {
        event.target.value = currentCard.value.description
        return event.target.blur()
      },

      // checkbox
      progressBar: computed(() => {
        if (currentCard.value.checkboxes) {
          const value = Math.round(checked.value.length / checkboxes.value.length * 100) / 100
          return checked.value.length === 0 ? 0 : value
        }

        return 0
      }),
      createCheckbox: () => {
        if (checkboxName.value !== '') {
          const checkbox = {
            name: checkboxName.value,
            checked: false
          }

          store.commit('boards/addCardCheckbox', {
            checkbox,
            listIndex: props.card.listIndex,
            cardIndex: props.card.cardIndex,
          })

          store.dispatch('boards/updateBoard', {
            lists: currentBoard.value.lists,
            id: currentBoard.value.id
          })

          checkboxName.value = ''
          showAddMenu.value = false
        } else {
          addCheckboxInput.value.focus();
        }
      },
      closeAddCheckboxMenu: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          checkboxName.value = ''
          showAddMenu.value = false
        }
      },
      updateCheckboxName: (event, index) => {
        let thisInput = event.target
        const thisCheckbox = currentCard.value.checkboxes[index]

        if (thisInput.value === '') {
          thisInput.value = thisCheckbox.name
        } else if (thisInput.value !== thisCheckbox.name) {
          store.commit('boards/updateCardCheckbox', {
            name: thisInput.value,
            checkboxIndex: index,
            listIndex: props.card.listIndex,
            cardIndex: props.card.cardIndex,
          })

          store.dispatch('boards/updateBoard', {
            lists: currentBoard.value.lists,
            id: currentBoard.value.id
          })
        }
      },
      toggleCardCheckbox: (index) => {
        let checkbox = checkboxes.value[index]

        checkbox.checked = !checkbox.checked

        const checked = checkboxes.value.filter(item => item.checked === true)

        store.commit('boards/toggleCardCheckbox', {
          listIndex: props.card.listIndex,
          cardIndex: props.card.cardIndex,
          checkboxes: checkboxes.value,
          checklistCompleted: checkboxes.value.length === checked.length
        })

        store.dispatch('boards/updateBoard', {
          lists: currentBoard.value.lists,
          id: currentBoard.value.id
        })
      },
      closeCheckboxNameInput: (event, index) => {
        event.target.value = currentCard.value.checkboxes[index].name
        return event.target.blur()
      },
      deleteCheckbox: (index) => {
        store.commit('boards/deleteCardCheckbox', {
          listIndex: props.card.listIndex,
          cardIndex: props.card.cardIndex,
          checkboxIndexToDelete: index,
        })

        store.dispatch('boards/updateBoard', {
          lists: currentBoard.value.lists,
          id: currentBoard.value.id
        })
      },

      onClose: () => {
        emit('closeCardModal')
      },
      onShow: () => {
        resizeTextArea(cardNameInput.value)
        resizeTextArea(cardDescriptionInput.value)
      },

      addCheckboxInput,
      showAddMenu,
      checkboxName,
      checkboxNameInputs,
      cardDescriptionInput,
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
.card-textarea {
  padding-left: 0.5rem;
  padding-block: 0.3rem;
  padding-right: 0.5rem;
  cursor: pointer;
  width: 100%;
  color: $blue-grey-8;
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
    background-color: white;
    cursor: text;
  }
}

.card-wrapper {
  min-width: 600px;
  padding-inline: 0.8rem;
  font-size: 1rem;

  .btn-delete-card {
    right: 2rem;
    font-size: 0.8rem;
    top: 4px;
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
    padding-bottom: 0.8rem;

    .q-icon {
      top: 1.05rem;
      left: -2rem;
    }

    .card-name-input {
      width: 30rem;
    }
  }

  .content {
    padding-top: 0;
    padding-bottom: 1.2rem;
    padding-inline: 0;

    .description-wrapper {
      padding-inline: 2.5rem;

      .description-title {
        margin-bottom: 0.8rem;
      }

      .card-description-input {
        background-color: rgba(9, 30, 66, 0.06);
        color: $blue-grey-10;
        border-radius: 3px;
        min-height: 3.2rem;
        width: 100%;
        font-size: 0.9rem;
        font-weight: normal;

        &:hover {
          background-color: #091E4212;
        }

        &:focus {
          background-color: white;
        }
      }

      textarea::placeholder {
        color: $blue-grey-9;
      }
    }

    .checklist-wrapper {
      margin-right: 1.8rem;

      .checkbox-wrapper {
        margin-left: -0.45rem;
        transition: background-color 0.3s;

        &:hover {
          background-color: rgba(9, 30, 66, 0.06);
        }

        .checkbox {
          margin-top: 0;
          margin-right: 0;
          margin-left: 0.6rem;
          width: 1.3rem;
          height: 1.3rem;

          &:hover {
            cursor: pointer;
          }
        }

        //if checkbox is checked draw a line through the text
        input[aria-checked=true] ~ textarea {
          text-decoration: line-through;
        }

        textarea {
          margin-left: 0.7rem;
          font-weight: normal;
        }

        .btn-delete {
          color: $blue-grey-7;
          font-size: 0.8rem;
        }
      }

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
        width: 31rem;
      }

      .add-checkbox-wrapper {
        margin-top: 0.8rem;
        margin-inline: 2.5rem;

        .btn-add-checkbox {
          font-size: 0.9rem;
          padding-inline: 0.5rem;
          margin-bottom: 0;
          text-transform: none;
          background-color: rgba(9, 30, 66, 0.06);
          color: $blue-grey-10;
          font-weight: normal;

          &:hover {
            background-color: #091E4212;
          }
        }

        .add-checkbox-menu {
          margin: 0;

          ::v-deep(.add-checkbox-input) {
            margin-bottom: 0.3rem;

            textarea {
              padding-left: 0.5rem;
              padding-block: 0.5rem;
              padding-right: 0.5rem;
              cursor: pointer;
              width: 100%;
              color: $blue-grey-10;
              font-weight: normal;
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
                background-color: white;
                cursor: text;
              }

              &::placeholder {
                font-weight: normal;
                color: black;
              }
            }
          }

          .btn-checkbox-actions {
            font-weight: normal;
            text-transform: none;
            font-size: 0.9rem;
            align-items: center;
          }

          .btn-checkbox-submit {
            font-size: 0.9rem;
            padding-inline: 0.7rem;
          }

          .btn-checkbox-cancel {
            margin-left: 0.1rem;

            & :hover {
              background-color: transparent;
            }
          }
        }
      }
    }
  }
}
</style>
