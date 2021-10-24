<template>
  <q-menu
    :offset="[8,0]"
    anchor="top right" self="top left"
    transition-show="jump-right"
    transition-hide="jump-left"
    style="background-color: #EEEEEEFF">

    <q-list dense>
      <q-item class="actions-items" clickable>
        <q-item-section>
          <div v-if="element === 'board'" class="board-color-wrapper text-grey-9">
            <div>Color</div>
            <div class="board-color" v-bind:style="{backgroundColor: currentBoard.color}"/>
          </div>

          <div v-else-if="element === 'list'" class="board-color-wrapper list-color-wrapper text-grey-9">
            <div>Color</div>
            <div class="list-color" v-bind:style="{backgroundColor: list.labelColor}"/>
          </div>
        </q-item-section>

        <color-select
          :offset="[8,0]"
          padding="0.8rem"
          background-color="#EEEEEEFF"
          :colorsArray="element === 'board' ? 'backgroundColors' : 'labelColors'"
          anchor="top right"
          self="top left"
          transition-show="jump-right"
          transition-hide="jump-left"
          :elementColor="element === 'board' ? currentBoard.color : list.labelColor"
          @updateColor="updateColor($event)"
        />
      </q-item>

      <q-separator/>

      <q-item class="delete-board actions-items text-grey-9" clickable @click="openDeleteModal" v-close-popup>
        <q-item-section>
          Delete {{ element }}
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>

  <delete-modal
    :showModal="showDeleteModal"
    :element="element"
    :list="list"
    :listIndex="listIndex"
    @closeDeleteModal="closeDeleteModal($event)"/>
</template>

<script>
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import {computed, ref} from "vue";
import DeleteModal from "components/DeleteModal";

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
    }
  },

  setup(props) {
    const store = useStore()
    const currentBoard = computed(() => store.getters["boards/currentBoard"])
    let showDeleteModal = ref(false)

    return {
      currentBoard,
      showDeleteModal,

      openDeleteModal: () => {
        showDeleteModal.value = true
      },

      closeDeleteModal: () => {
        showDeleteModal.value = false
      },

      updateColor: (color) => {
        if (props.element === 'board') {
          if (currentBoard.value.color !== color) {
            store.dispatch('boards/updateBoard', {
              id: currentBoard.value.id,
              color
            })
          }
        } else {
          store.commit('boards/updateList', {
            index: props.listIndex,
            list: {
              ...props.list,
              labelColor: props.list.labelColor !== color ? color : null
            }
          })
          store.dispatch('boards/updateBoard', {
            id: currentBoard.value.id,
            lists: currentBoard.value.lists
          })
        }
      },
    }
  },

  components: {
    'delete-modal': require('components/DeleteModal').default,
    'color-select': require('components/ColorSelect').default
  }
}
</script>

<style lang="scss" scoped>
.actions-items {
  padding: 0.4rem 0.6rem;
}

.delete-board {
  color: $grey-2;
  font-weight: bold;
  font-size: 1rem;
}

.board-color-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-around;
  color: $grey-2;
  font-weight: bold;
  font-size: 1rem;

  .board-color {
    width: 2rem;
    height: 1.4rem;
    border-radius: 4px;
    cursor: pointer;
  }
}

.list-color-wrapper {
  justify-content: space-between;

  .list-color {
    width: 1.7rem;
    height: 1.4rem;
    border-radius: 4px;
    cursor: pointer;
  }
}
</style>
