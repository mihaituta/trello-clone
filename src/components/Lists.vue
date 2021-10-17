<template>
  <div class="cards-wrapper q-mt-sm q-mx-sm">
    <q-card
      draggable="true"
      @dragenter="onDragEnter(list)"
      @dragleave="onDragLeave"
      @dragover="onDragOver"
      @drop="onDrop(list)"
      @dragstart="onDragStart(list)"
      v-for="list in currentBoard.lists" class="list-card shadow-0">
      <q-card-section class="card-title flex items-center">
        {{ list.name }}
        <q-space/>
        <q-btn class="btn-list-delete" icon="clear" @click="deleteList(list)" unelevated/>
      </q-card-section>

      <q-card-section class="list-content q-py-none q-px-sm">

        <cards :list="list"/>
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
import {ref, computed} from "vue";
import {useStore} from "vuex";
import {arrayUnion} from "boot/firebase";
import {v4 as uuidv4} from "uuid";

export default {
  setup() {
    const store = useStore()
    const addListInput = ref(null)
    const showMenu = ref(false)
    const listName = ref('')

    const currentBoard = computed(() => store.getters["boards/currentBoard"])

    return {
      addListInput,
      listName,
      showMenu,
      currentBoard,

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

      // store the id of the draggable element
      onDragStart(list) {
        // console.log('Started dragging ' + list.name)
      },

      onDragEnter(list) {
        // don't drop on other draggables
        // console.log('entering ' + list.name)

      },

      onDragLeave(e) {
        // console.log('leaving')
      },

      onDragOver(e) {
        // console.log('overr')
        e.preventDefault()
      },

      onDrop(list) {
        // console.log('drop on ' + list.name)

      }
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

.scroll-area {
  height: 100%;
  width: 100%;
}

.list-card {
  background-color: $blue-grey-1;
  color: $grey-9;
  width: 15rem;
  min-width: 15rem;
  height: auto;
  min-height: 5.1rem;
  margin-right: 0.5rem;
  border-radius: 3px;
  font-weight: bold;

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

  }
}
</style>
