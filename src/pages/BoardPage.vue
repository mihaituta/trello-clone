<template>
  <div>{{ board.name }}</div>
</template>

<script>
import {computed, onBeforeUnmount, watch} from "vue";
import {useStore} from "vuex";
import {useRoute} from "vue-router";

export default {
  setup() {
    const store = useStore()
    const route = useRoute()

    // reset currentBoard when changing the page
    onBeforeUnmount(() => {
      store.commit('boards/setCurrentBoard', {board: {}})
    })

    // watch when the slug changes and change the board accordingly
    watch(() => route.params.slug, () => {
      store.commit('boards/setCurrentBoard', {slug: route.params.slug})
    });

    return {
      route,
      board: computed(() => store.getters["boards/currentBoard"]),
      boards: computed(() => store.getters["boards/boards"]),
    }
  }
}
</script>

<style scoped>

</style>
