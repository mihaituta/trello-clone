<template>
  <q-menu auto-close
          :self="self"
          :anchor="anchor"
          :offset="offset"
          :transition-show="transitionShow"
          :transition-hide="transitionHide"
          v-bind:style="{padding: padding, backgroundColor, boxShadow}"
          style="
            display: grid;
            grid-template-columns: repeat(3, minmax(40px, 1fr));
            gap: 0.5rem;">
    <q-btn
      v-for="color in colors"
      :key="color"
      @click="selectColor(color)"
      v-bind:style="{backgroundColor: color}"
    >
      <q-icon v-if="elementColor === color" name="done" color="white"/>
    </q-btn>
  </q-menu>
</template>

<script>
import {computed} from 'vue'
import {useStore} from "vuex";

export default {
  props: {
    elementColor: {
      type: String
    },
    padding: {
      type: String
    },
    colorsArray: {
      type: String
    },
    backgroundColor: {
      type: String
    },
    boxShadow: {
      type: String
    },
    offset: {
      type: Array
    },
    self: {
      type: String
    },
    anchor: {
      type: String
    },
    transitionShow: {
      type: String
    },
    transitionHide: {
      type: String
    },
  },
  emits: ['updateColor'],
  setup(props, {emit}) {
    const store = useStore()
    return {
      selectColor: (color) => {
        emit('updateColor', color)
      },

      colors: computed(() => store.getters[`mainStore/${props.colorsArray}`]),
    }
  }
}
</script>

<style scoped>

</style>
