<template>
  <q-page class="q-px-xl q-py-lg">
    <div class="title">My boards</div>

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
    </div>

  </q-page>
</template>

<script>
import {defineComponent, ref, computed} from 'vue';
import {useStore} from "vuex";
import {useRouter} from 'vue-router'

export default defineComponent({
  setup() {
    const store = useStore()
    const router = useRouter()
    return {
      goToBoard: (board) => {
        store.commit('boards/setCurrentBoard', board)
        router.push({name: 'board', params: {slug: board.slug}});
      },
      boards: computed(() => store.getters["boards/boards"]),
    }
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
    font-size: 1.1rem;
    color: $grey-2;
    min-width: 12rem;
    height: 7rem;
    margin-right: 1.5rem;
    margin-bottom: 1.5rem;
  }
}
</style>
