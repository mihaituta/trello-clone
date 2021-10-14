<template>
  <q-layout view="lHh Lpr fFf" class="bg-grey-2">

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
      width: 90px;
      height: 20px;
      background-image: url("../assets/trello-logo-auth.svg");
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center;
      cursor: pointer;
    }
  }
}

</style>
