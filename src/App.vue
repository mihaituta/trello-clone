<template>
  <router-view/>
</template>
<script>
import {defineComponent} from 'vue';
import {mapActions} from 'vuex';

export default defineComponent({
  methods: {
    ...mapActions('mainStore', ['handleAuthStateChanged'])
  },
  mounted() {
    this.handleAuthStateChanged()
  },
})
</script>
