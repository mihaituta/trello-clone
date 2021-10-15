<template>
  <q-page class="q-px-sm q-py-sm">
    <!--    <div contenteditable="true"
             class="board-name q-px-sm q-py-xs"
             @keypress.enter="save"
             @keydown.esc="cancel"

        >
          {{ currentBoard.name }}
        </div>-->
    <!--    <input
          @keydown.enter="save"
          @keydown.esc="cancel"
        />-->

    <input
      class="board-name q-px-sm q-py-xs"
      type="text"
      v-model="boardName"
      v-autowidth="{maxWidth: '100%'}"
      @blur="changeName"
      @keypress.enter="$event.target.blur()"
      @keyup.esc="close"
    />

  </q-page>
</template>

<script>
import {computed, onBeforeUnmount, ref, onMounted, watch} from "vue";
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";
import {directive as VueInputAutowidth} from "vue-input-autowidth"

export default {
  directives: {autowidth: VueInputAutowidth},

  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const boardName = ref()

    // reset currentBoard when changing the page
    onBeforeUnmount(() => {
      store.commit('boards/setCurrentBoard', {board: {}})
    })

    const currentBoard = computed(() => store.getters["boards/currentBoard"])
    boardName.value = currentBoard.value.name

    watch(currentBoard, () => {
      boardName.value = currentBoard.value.name
    })

    return {
      route,
      boardName,

      close: (event) => {
        boardName.value = currentBoard.value.name
        event.target.blur()
      },

      changeName: () => {
        if (boardName.value !== currentBoard.value.name) {
          store.dispatch('boards/updateBoard', {
            name: boardName.value,
            id: currentBoard.value.id
          }).then(() => {
            router.replace({name: 'board', params: {slug: currentBoard.value.slug}})
          })
        }
      },

      boards: computed(() => store.getters["boards/boards"]),
    }
  }
}
</script>

<style lang="scss" scoped>
/*.board-name {
  cursor: pointer;
  color: $grey-2;
  font-size: 1.3rem;
  font-weight: bold;
  background-color: #ffffff3d;
  border: none;
  outline: none;
  width: fit-content;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  border-radius: 3px;

  &:focus {
    color: $blue-grey-10;
    background-color: $grey-3;
    cursor: text;
  }
}*/

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
</style>
