<template>
  <q-page class="q-py-sm row no-wrap">
    <div class="col">
      <div class="column full-height">
        <q-scroll-area class="scroll-area col">
          <div class="q-px-sm flex no-wrap">
            <input
              class="board-name q-px-sm q-pt-xs q-mr-sm"
              type="text"
              v-model="board.name"
              v-autowidth="{maxWidth: '100%'}"
              @blur="updateName"
              @keypress.enter="$event.target.blur()"
              @keyup.esc="closeInput"
              maxlength="100"
            />

            <q-btn class="btn-actions" icon="more_horiz" unelevated>
              <menu-actions element="board"/>
            </q-btn>
          </div>
          <lists/>
        </q-scroll-area>
      </div>
    </div>
  </q-page>
</template>

<script>
import {computed, onBeforeUnmount, reactive, ref, watch} from "vue";
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";
import {directive as VueInputAutowidth} from "vue-input-autowidth"

export default {
  directives: {autowidth: VueInputAutowidth},

  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const currentBoard = computed(() => store.getters["boards/currentBoard"])
    let board = reactive({
      color: currentBoard.value.color,
      name: currentBoard.value.name
    })

    // set the boardName from the state when refreshing page
    watch(currentBoard, () => board.name = currentBoard.value.name)

    // reset currentBoard when changing the page
    onBeforeUnmount(() => store.commit('boards/setCurrentBoard', {board: {}}))

    return {
      route,
      board,
      currentBoard,

      closeInput: (event) => {
        board.name = currentBoard.value.name
        return event.target.blur()
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
    'color-select': require('components/ColorSelect').default,
    'lists': require('components/Lists').default,
    'menu-actions': require('components/menuActions').default
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
    box-shadow: inset 0 0 0 2px $primary;
    border-radius: 3px;
    border: none;
    outline: none;
    color: $blue-grey-10;
    background-color: $grey-3;
    cursor: text;
  }
}

.btn-actions {
  background-color: #ffffff3d;
  color: $grey-2;
}
</style>
