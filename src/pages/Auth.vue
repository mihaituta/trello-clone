<template>
  <q-page class="auth-page column">
    <div class="logo-container"><img src="../assets/trello-logo-auth.svg" alt="trello logo"></div>

    <q-card class="auth-card shadow-2 bg-grey-2">
      <q-tabs
        v-model="tab"
        active-color="primary"
        indicator-color="primary"
        class="auth-tabs"
      >
        <q-tab name="login" label="Login"/>
        <q-tab name="register" label="Register"/>
      </q-tabs>

      <q-separator/>

      <q-tab-panels
        v-model="tab"
        animated
        swipeable
        class="bg-grey-2"
      >
        <q-tab-panel name="login">
          <auth-form :tab="tab"/>
        </q-tab-panel>

        <q-tab-panel name="register">
          <auth-form :tab="tab"/>
        </q-tab-panel>

      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script>
import {ref} from 'vue'

export default {
  setup() {
    const tab = ref('login')
    return {
      tab
    }
  },

  components: {
    'auth-form': require('components/AuthForm').default
  }
}
</script>

<style lang="scss" scoped>
.auth-tabs .q-tab__label {
  font-size: 1.2rem;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 6rem;

  img {
    width: 12rem;
  }
}

@media (min-width: $breakpoint-sm-min) {
  .auth-page {
    align-items: center;

    .auth-card {
      min-height: 44rem;

      .q-tab-panels {
        padding-top: 1rem;
      }
    }
  }
}
</style>
