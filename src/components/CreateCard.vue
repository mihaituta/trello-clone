<template>
  <div>
    <q-btn v-if="!showAddMenu" dense unelevated class="btn-add-card q-mb-sm" label="Add a card" icon="add"
           @click.stop="showAddMenu = true"/>
    <div
      v-else
      class="card-add-menu"
      tabindex="0"
      @focusout="closeCardAddMenu"
    >
      <q-form @submit.stop="createCard">
        <q-card class="shadow-1">
          <q-input
            ref="addCardInput"
            autofocus
            borderless
            class="card-textarea q-pa-sm q-mb-sm"
            autogrow
            rows="1"
            v-model="cardName"
            type="textarea"
            @keydown.enter="createCard"
            placeholder="Enter a title for this card..."
            maxlength="128"
          />
        </q-card>

        <div class="q-mb-sm">
          <q-btn class="btn-actions btn-list-submit" dense unelevated color="primary" type="submit" label="Add card"/>
          <q-btn class="btn-actions btn-list-cancel" dense unelevated text-color="grey-9" icon="close"
                 @click.stop="closeCardAddMenu"/>
        </div>
      </q-form>
    </div>
  </div>
</template>

<script>
import {ref, computed} from "vue";
import {useStore} from "vuex";

export default {
  props: {
    list: {
      type: Object
    },
  },

  setup(props) {
    const store = useStore()
    const cardName = ref('')
    const showAddMenu = ref(false)
    const addCardInput = ref(null)
    const currentBoard = computed(() => store.getters["boards/currentBoard"])

    return {
      cardName,
      showAddMenu,
      addCardInput,

      closeCardAddMenu: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          cardName.value = ''
          showAddMenu.value = false
        }
      },

      createCard: () => {
        if (cardName.value !== '') {

          store.commit('boards/addCard', {
            card: {
              name: cardName.value
            },
            list_id: props.list.id
          })

          store.dispatch('boards/updateBoard', {
            lists: currentBoard.value.lists,
            id: currentBoard.value.id
          })

          cardName.value = ''
          showAddMenu.value = false
        } else {
          addCardInput.value.focus();
        }
      },
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep(.btn-add-card) {
  width: 100%;
  align-items: start;
  font-weight: normal;
  text-transform: none;
  font-size: 0.95rem;
  color: $grey-7;
  padding: 0;

  .on-left {
    color: $grey-6;
    font-size: 1.25rem;
    margin-right: 0.2rem;
  }
}

::v-deep(.card-textarea) {
  textarea {
    resize: vertical;
    padding: 0;
    max-height: 10rem;
    overflow: auto;
    word-break: break-word;
  }
}

.btn-actions {
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

</style>
