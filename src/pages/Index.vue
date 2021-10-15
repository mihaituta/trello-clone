<template>
  <q-page class="q-px-xl q-py-lg">
<!--    <color-select
      @closeColorsModal="closeColorsModal($event)"
      :open="openModal"
    />-->

    <div class="title">Your boards</div>

    <div class="boards-wrapper">
      <q-card
        v-for="board in boards"
        :key="board.id"
        class="board-card"
        v-bind:style="{backgroundColor: board.color}"
        @click="goToBoard(board)"
      >
        <q-card-section>
          {{ board.name }}
        </q-card-section>
      </q-card>

      <q-card class="board-card card-create">
        <q-card-section class="flex justify-between items-center">
          <div>Create board</div>
          <q-btn color="primary" icon="add" @click="createBoard" :disable="!board.name"></q-btn>
        </q-card-section>
        <q-card-actions class="flex justify-between items-center">
          <q-input
            dense
            outlined
            v-model="board.name"
            label="Name"
          >
          </q-input>
          <div class="board-color" v-bind:style="{backgroundColor: board.color}">
            <q-menu auto-close
                    :offset="[0, 8]"
                    transition-show="jump-down"
                    transition-hide="jump-up"
                    style="
                    background-color: transparent;
                    box-shadow: none;
                    display: grid;
                    grid-template-columns: repeat(3, minmax(40px, 1fr));
                    gap: 0.5rem;
                    ">
              <q-btn
                v-for="color in colors"
                :key="color"
                @click="selectColor(color)"
                v-bind:style="{backgroundColor: color}"
              />
            </q-menu>
          </div>
        </q-card-actions>
      </q-card>
    </div>

  </q-page>
</template>

<script>
import {defineComponent, computed, ref, reactive} from 'vue';
import {useStore} from "vuex";
import {useRouter} from 'vue-router'

export default defineComponent({
  setup() {
    const store = useStore()
    const router = useRouter()
    const colors = computed(() => store.getters["mainStore/colors"])
    const openModal = ref(false)

    let board = reactive({
      color: colors.value[0],
      name: ''
    })

    return {
      board,
      openModal,

      selectColor: (color) => {
        board.color = color
      },
      /*   closeColorsModal: () => {
           openModal.value = false
         },

         openColorsMedal: () => {
           openModal.value = true
         },*/

      createBoard: () => {
        store.dispatch('boards/addBoard', board).then((res) => {
          console.log(res)
          board.color = colors.value[0]
          board.name = ''
        })
      },

      goToBoard: (board) => {
        router.push({name: 'board', params: {slug: board.slug}}).then(() => {
            store.commit('boards/setCurrentBoard', {board})
          }
        );
      },
      colors: computed(() => store.getters["mainStore/colors"]),
      boards: computed(() => store.getters["boards/boards"]),
      currentBoard: computed(() => store.getters["boards/currentBoard"]),
    }
  },
  components: {
    'color-select': require('components/ColorSelect').default
  }
})
</script>

<style lang="scss" scoped>
.title {
  margin-bottom: 0.8rem;
  color: $blue-grey-10;
  font-weight: bold;
  font-size: 2rem;
}

.boards-wrapper {
  display: flex;
  flex-wrap: wrap;

  .board-card {
    cursor: pointer;
    font-weight: bold;
    font-size: 1.3rem;
    color: $grey-2;
    min-width: 14rem;
    height: 7rem;
    margin-right: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .card-create {
    cursor: default;
    color: $blue-grey-10;

    .q-card__section {
      padding-bottom: 0.2rem;
      padding-top: 0.85rem;


      .q-btn {
        width: 2.5rem;

        font-size: 0.8rem;
      }
    }

    .q-card__actions {
      padding-right: 1rem;
      padding-left: 1rem;

      .q-input {
        font-weight: bold;
        font-size: 1rem;
        width: 8.5rem;
      }

      .board-color {
        width: 2.5rem;
        height: 2.05rem;
        border-radius: 3px;
        cursor: pointer;
      }
    }
  }
}
</style>
