<template>
  <q-layout view="hHh lpR fff" class="bg-grey-2">

    <q-header bordered>
      <q-toolbar>
        <q-toolbar-title shrink>
          <RouterLink to="/">
            <div class="logo"/>
          </RouterLink>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view/>
    </q-page-container>

    <q-footer bordered>
      <div class="footer-title text-center">This is a personal trello-clone project I created for my portfolio, it is
        <b>not</b> for commercial use.
      </div>
    </q-footer>

  </q-layout>
</template>

<script>
export default {
  name: "notAuth",

}
</script>

<style lang="scss" scoped>
.q-header {
  background-color: $grey-2;

  .q-toolbar {
    padding-left: 0.7rem;

    .logo {
      width: 110px;
      height: 30px;
      background-image: url("../assets/trello-logo-auth.svg");
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center;
      cursor: pointer;
    }
  }
}

.q-footer {
  background-color: $grey-2;
  color: $grey-9;
  font-size: 1.1rem;
  min-height: 3.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
