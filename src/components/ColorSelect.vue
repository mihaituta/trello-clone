<template>
  <q-dialog
    @hide="onClose"
    @before-show="onShow"
    v-model="open">
    <div>SMS</div>
  </q-dialog>
</template>

<script>
import {ref} from 'vue'

export default {
  props: {
    open: {
      required: true,
      type: Boolean
    },
  },
  emits: ['closeColorsModal', 'selectedColor'],

  setup(_, {emit}) {
    const closeModal = () => emit('closeColorsModal')
    return {
      onClose: () => closeModal(),

      onShow: () => {
        console.log('show')
      },
    }
  }
}
</script>

<style scoped>

</style>
