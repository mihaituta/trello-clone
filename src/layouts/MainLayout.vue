<template>
  <q-layout view="hhh lpR fFf" class="bg-teal-3">

    <q-header class="text-white">
      <q-toolbar>
        <q-toolbar-title>
          <RouterLink to="/" class="link flex items-center q-electron-drag--exception">
            <div class="logo"></div>
          </RouterLink>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      behavior="desktop"
      class="drawer"
      mini-width="48"
      width="260"
      no-swipe-open
      no-swipe-backdrop
      no-swipe-close
      show-if-above
      side="left"
      v-bind:class="{ opened: !miniState}"
      v-model="drawer"
      :mini="!drawer || miniState"
      @click.capture="drawerClick"
    >
      <div v-if="miniState" class="drawer-closed-content row justify-center q-mt-sm">
        <div class="name-letter q-mb-md">T</div>
        <q-icon size="sm" name="keyboard_double_arrow_right"/>
      </div>

      <q-list v-else>
        <q-item class="no-padding" @click=" ">
          <q-item-section class="flex items-center q-pr-none q-ml-sm" side>
            <div class="name-letter">T</div>
          </q-item-section>

          <q-item-section class="q-pl-sm text-weight-bold text-grey-8">
            <q-item-label>Tuta Mihai's Workspace</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn flat icon="keyboard_double_arrow_left" @click="miniState = true"/>
          </q-item-section>
        </q-item>
        <q-separator/>

        <q-expansion-item
          v-model="expended"
          class="text-grey-7 q-mt-sm"
          dense
          expand-icon-toggle
        >
          <template v-slot:header>
            <q-item-section class="text-weight-bold">
              Your boards
            </q-item-section>
            <q-btn style="width: 0.5rem; font-size: 0.8rem" flat icon="add" color="grey-6" @click=""/>
          </template>

          <q-item class="board" dense clickable v-ripple>
            <q-item-label class="flex items-center">
              <div class="q-mr-sm board-color"/>
              Weight Tracker App
            </q-item-label>
          </q-item>

          <q-item class="=board" dense clickable v-ripple>
            <q-item-label class="flex items-center">
              <div class="q-mr-sm board-color"/>
              Trello clone
            </q-item-label>
          </q-item>
        </q-expansion-item>

      </q-list>

    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

  </q-layout>
</template>

<script>
import {ref} from 'vue'

export default {
  setup() {
    const miniState = ref(true)
    const expended = ref(true)
    // const miniState = ref(true)

    return {
      drawer: ref(false),
      miniState,
      expended,

      drawerClick(e) {
        // if in "mini" state and user
        // click on drawer, we switch it to "normal" mode
        if (miniState.value) {
          miniState.value = false

          // notice we have registered an event with capture flag;
          // we need to stop further propagation as this click is
          // intended for switching drawer to "normal" mode only
          e.stopPropagation()
        }
      }
    }
  }
}
</script>

<style lang="scss">
.q-header {
  background-color: rgba(0, 0, 0, 0.45);

  .q-toolbar {
    padding-left: 0.7rem;
    height: 0.5rem;

    .q-toolbar-title {
      display: flex;
      align-items: center;
    }

    img {
      width: 1rem;
      height: 1rem;
    }

    .logo {
      width: 90px;
      height: 20px;
      background-image: url("../assets/logo.png");
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center;
      cursor: pointer;

      &:hover {
        background-image: url("../assets/logo-loading.gif");
      }
    }
  }


}

.q-drawer {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 100%);
  transition: background-color 0.3s;
  box-shadow: 1px 0 0 rgb(9 30 66 / 8%);

  .drawer-closed-content {
    display: flex;
    color: white;

    :hover > & {
      color: $grey-8;
    }
  }

  .q-item__section--side {
    padding-left: 0;
  }

  .name-letter {
    background: linear-gradient(#cc4223, #cb7d25);
    height: 2rem;
    width: 2rem;
    padding-top: 0.1rem;
    border-radius: 6px;
    font-size: 1.25rem;
    font-weight: bold;
    display: flex;
    text-align: center;
    justify-content: center;
    color: white;
  }

  .board-color {
    width: 1.5rem;
    height: 1.2rem;
    background-color: red;
    border-radius: 2px;
  }

  .opened {
    background-color: white;
    cursor: default;
  }

  &:hover {
    background: white;
    color: black;
    cursor: pointer;
  }
}
</style>
