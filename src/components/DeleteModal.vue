<template>
  <q-dialog class="text-grey-8"
            v-model="showModal"
            @hide="onClose">
    <q-card>
      <q-card-section class="modal-title-wrapper row items-center justify-center text-grey-8 relative-position">
        <div class="modal-title">Delete {{ element }}?</div>
        <q-btn class="absolute-right btn-close-modal" color="grey-7" icon="close" flat dense v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section class="modal-content">
        Deleting a {{ element }} is forever. There is no undo.
      </q-card-section>

      <q-card-actions class="q-pt-none">
        <q-btn class="full-width " unelevated :label="'Delete ' + element" color="negative" @click="deleteElement"
               v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {useStore} from "vuex";
import {computed, ref} from "vue";

export default {
  props: {
    element: {
      type: String
    },
    list: {
      type: Object
    },
    listIndex: {
      type: Number
    },
    cardIndex: {
      type: Number
    },
    showModal: {
      type: Boolean
    },
  },
  emits: ['closeDeleteModal', 'deleteCard'],

  setup(props, {emit}) {
    const store = useStore()
    const currentBoard = computed(() => store.getters["boards/currentBoard"])

    return {
      currentBoard,

      deleteElement: () => {
        if (props.element === 'board') {
          store.dispatch('boards/deleteBoard', currentBoard.value.id)

        } else if (props.element === 'list') {
          store.dispatch('lists/deleteList', props.list)

        } else if (props.element === 'card') {
          emit('deleteCard')
          /*  store.commit('boards/deleteCard', {
              listIndex: props.listIndex,
              cardIndex: props.cardIndex
            })

            store.dispatch('boards/updateBoard', {
              lists: currentBoard.value.lists,
              id: currentBoard.value.id
            })*/
        }
      },

      onClose: () => {
        emit('closeDeleteModal')
      },
    }
  }
}
</script>

<style lang="scss" scoped>
.q-dialog {
  .modal-title-wrapper {
    padding: 0.7rem;

    .modal-title {
      font-weight: bold;
      font-size: 1rem;
    }
  }

  .btn-close-modal {
    width: 3rem;
    font-size: 0.8rem;
    padding-bottom: 0;
  }

  .modal-content {
    padding: 0.7rem;
    font-size: 1rem;
  }
}
</style>
