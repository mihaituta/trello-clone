<template>
  <div>{{ board.name }}</div>
</template>

<script>
import {computed, onBeforeUnmount} from "vue";
import {useStore} from "vuex";

export default {
  setup() {
    const store = useStore()

    onBeforeUnmount(() => {
      store.commit('boards/setCurrentBoard', {})
    })

    return {
      board: computed(() => store.getters["boards/currentBoard"]),
      boards: computed(() => store.getters["boards/boards"]),
    }
  }
}
</script>

<style scoped>

</style>
