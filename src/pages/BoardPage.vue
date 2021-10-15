<template>
  <q-page class="q-px-sm q-py-sm">
    <div class="flex">
      <input
        class="board-name q-px-sm q-py-xs q-mr-sm"
        type="text"
        v-model="board.name"
        v-autowidth="{maxWidth: '100%'}"
        @blur="updateName"
        @keypress.enter="$event.target.blur()"
        @keyup.esc="closeInput"
      />

      <q-btn class="btn-actions" icon="more_horiz" unelevated>
        <q-menu
          :offset="[8,0]"
          anchor="top right" self="top left"
          transition-show="jump-right"
          transition-hide="jump-left"
          style="background-color: #ffffff3d;  box-shadow: none;">
          <q-list dense>
            <q-item class="actions-items" clickable>
              <q-item-section>
                <div class="color-wrapper">
                  <div>Color</div>
                  <div class="board-color" v-bind:style="{backgroundColor: currentBoard.color}">
                  </div>
                </div>
              </q-item-section>
              <color-select
                :offset="[8,0]"
                padding="0.8rem"
                background-color="#ffffff3d"
                anchor="top right"
                self="top left"
                transition-show="jump-right"
                transition-hide="jump-left"
                @updateColor="updateColor($event)"
              />
            </q-item>

            <q-separator/>

            <q-item class="delete-board actions-items" clickable @click="deleteBoard" v-close-popup>
              <q-item-section>
                Delete board
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>

    <div class="flex q-mt-md">
      <q-btn unelevated class="btn-add-list" label="Add new list" icon="add">
        <q-menu
          fit anchor="top left" self="top left"
          style="box-shadow: none;"
        >
          <!--          transition-show="jump-down"
                    transition-hide="jump-up"-->
          <q-form>
            <q-list class="add-list" dense>
              <q-item>
                <input placeholder="Enter list title..."/>
              </q-item>
              <q-item v-close-popup>
                <q-btn class="btn-list-submit" dense unelevated color="primary" label="Add list"/>
                <q-btn class="btn-list-cancel" dense unelevated text-color="grey-9" icon="close"/>
              </q-item>
            </q-list>
          </q-form>
        </q-menu>
      </q-btn>
    </div>
  </q-page>
</template>

<script>
import {computed, onBeforeUnmount, reactive, ref, watch} from "vue";
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";
import {useQuasar} from 'quasar'

import {directive as VueInputAutowidth} from "vue-input-autowidth"
import ColorSelect from "components/ColorSelect";

export default {
  directives: {autowidth: VueInputAutowidth},

  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const $q = useQuasar()
    const currentBoard = computed(() => store.getters["boards/currentBoard"])
    let board = reactive({
      color: currentBoard.value.color,
      name: currentBoard.value.name
    })

    const deleteBoard = () => {
      $q.dialog({
        title: 'Confirm',
        message: `Delete board ${currentBoard.value.name}?`,
        style:
          'background-color: #ffffff3d;' +
          'color: white;' +
          'font-size: 1.1rem;' +
          'width: 20rem',
        ok: {
          label: 'Yes',
          color: 'negative',
          unelevated: true,
        },
        cancel: {
          color: 'primary',
          unelevated: true,
        },
      }).onOk(() => {
        store.dispatch('boards/deleteBoard', currentBoard.value.id)
      })
    }

    // set the boardName from the state when refreshing page
    watch(currentBoard, () => {
      board.name = currentBoard.value.name
    })

    // reset currentBoard when changing the page
    onBeforeUnmount(() => {
      store.commit('boards/setCurrentBoard', {board: {}})
    })

    return {
      route,
      board,
      currentBoard,
      deleteBoard,

      closeInput: (event) => {
        board.name = currentBoard.value.name
        return event.target.blur()
      },

      updateColor: (color) => {
        board.color = color
        store.dispatch('boards/updateBoard', {
          color: board.color,
          id: currentBoard.value.id
        })
      },

      updateName: () => {
        if (board.name === '') {
          board.name = currentBoard.value.name
        } else if (board.name !== currentBoard.value.name) {
          store.dispatch('boards/updateBoard', {
            name: board.name,
            id: currentBoard.value.id
          }).then(() => {
            // update the url slug when the name is changed
            router.replace({name: 'board', params: {slug: currentBoard.value.slug}})
          })
        }
      },


      boards: computed(() => store.getters["boards/boards"]),
    }
  },
  components: {
    ColorSelect,
    components: {
      'color-select': require('components/ColorSelect').default
    }
  }
}
</script>

<style lang="scss" scoped>
.board-name {
  cursor: pointer;
  color: $grey-2;
  font-size: 1.3rem;
  font-weight: bold;
  background-color: #ffffff3d;
  border: none;
  outline: none;
  border-radius: 3px;

  &:focus {
    color: $blue-grey-10;
    background-color: $grey-3;
    cursor: text;
  }
}

.btn-actions {
  background-color: #ffffff3d;
  color: $grey-2;
}

.actions-items {
  padding: 0.4rem 0.6rem;
}

.delete-board {
  color: $grey-2;
  font-weight: bold;
  font-size: 1.1rem;
}

.color-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-around;
  color: $grey-2;
  font-weight: bold;
  font-size: 1.1rem;

  .board-color {
    width: 2rem;
    height: 1.6rem;
    border-radius: 4px;
    cursor: pointer;
  }
}

::v-deep(.btn-add-list) {
  align-items: start;
  font-weight: normal;
  text-transform: none;
  font-size: 1rem;
  width: 15rem;
  background-color: #ffffff3d;
  color: $grey-2;

  .on-left {
    font-size: 1.3rem;
    margin-right: 0.2rem;
  }
}

.add-list {
  padding: 0.3rem;

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


</style>
