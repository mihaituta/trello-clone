<template>
  <q-layout
    view="hhh lpR fFf"
    v-bind:style="{backgroundColor: currentBoard ? currentBoard.color : '#F5F5F5FF'}"
  >
    <q-header
      class="text-grey-2"
      v-bind:style="{backgroundColor: headerColor}"
    >
      <q-toolbar>
        <q-toolbar-title shrink>
          <RouterLink to="/" class="link">
            <div class="logo"/>
          </RouterLink>
        </q-toolbar-title>

        <q-space/>

      </q-toolbar>
    </q-header>

    <q-drawer
      behavior="desktop"
      class="drawer"
      :mini-width="48"
      :width="260"
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
        <div class="name-letter q-mb-md">{{ String(user.name).charAt(0).toUpperCase() }}</div>
        <q-icon size="sm" name="keyboard_double_arrow_right"/>
      </div>

      <q-list v-else>
        <q-item class="no-padding" @click=" ">
          <q-item-section class="flex items-center q-pr-none q-ml-sm" side>
            <div class="name-letter">{{ String(user.name).charAt(0).toUpperCase() }}</div>
          </q-item-section>

          <q-item-section class="q-pl-sm text-weight-bold text-grey-8 text-capitalize">
            <q-item-label>{{ user.name }}'s Workspace</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn flat icon="keyboard_double_arrow_left" @click="miniState = true"/>
          </q-item-section>
        </q-item>

        <q-separator/>

        <q-expansion-item
          v-model="expended"
          class="text-grey-7 q-my-sm"
          dense
          expand-icon-toggle
        >
          <template v-slot:header>
            <q-item-section class="text-weight-bold">
              Your boards
            </q-item-section>
          </template>

          <q-list v-for="board in boards">
            <q-item class="board" dense clickable v-ripple @click="goToBoard(board)">
              <q-item-label class="flex no-wrap items-center">
                <div class="q-mr-sm board-color" v-bind:style="{backgroundColor: board.color}"/>
                <div class="board-name">{{ board.name }}</div>
              </q-item-label>
            </q-item>
          </q-list>

        </q-expansion-item>

        <q-separator/>

        <q-btn
          class="btn-logout text-grey-7 q-mt-sm"
          flat
          icon="logout"
          label="Logout"
          @click="logoutUser"
        />

      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

  </q-layout>
</template>

<script>
import {ref, computed, onBeforeUpdate, watch} from 'vue'
import {useStore} from 'vuex'
import {useRoute, useRouter} from 'vue-router'
import {getCssVar} from 'quasar'

export default {

  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    const miniState = ref(true)
    const expended = ref(true)

    onBeforeUpdate(() => {
      miniState.value = true
    })

    // watch when the slug in the url changes and set the board in state accordingly
    watch(() => route.params.slug, () => {
      store.commit('boards/setCurrentBoard', {slug: route.params.slug})
    });

    const currentBoard = computed(() => store.getters['boards/currentBoard'])
    const boards = computed(() => store.getters["boards/boards"])
    const user = computed(() => store.getters["mainStore/user"])

    return {
      drawer: ref(false),
      miniState,
      expended,
      boards,
      user,
      currentBoard,

      logoutUser: () => store.dispatch('mainStore/logoutUser'),

      goToBoard: (board) => {
        router.push({name: 'board', params: {urlId: board.urlId, slug: board.slug}}).then(() => {
            store.commit('boards/setCurrentBoard', {board})
          }
        );
      },

      drawerClick: (e) => {
        if (miniState.value) {
          miniState.value = false
          e.stopPropagation()
        }
      },

      headerColor: computed(() => {
        if (route.name === 'home')
          return getCssVar('primary')
      }),
    }
  }
}
</script>

<style lang="scss" scoped>
.q-layout{
  background-color: #F5F5F5FF;
}
.q-header {
  backdrop-filter: blur(24px);
  background-color: rgba(0, 0, 0, 0.45);

  .q-toolbar {
    padding-left: 0.7rem;
    height: 0.5rem;

    img {
      width: 1rem;
      height: 1rem;
    }

    .logo {
      width: 100px;
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

::v-deep(.q-drawer) {
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

  .board-name {
    flex: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .board-color {
    width: 1.5rem;
    height: 1.2rem;
    border-radius: 2px;
  }

  .opened {
    background-color: $grey-2;
    cursor: default;
  }

  &:hover {
    background: $grey-2;
    color: black;
    cursor: pointer;
  }
}

::v-deep(.btn-logout) {
  width: 100%;
  align-items: start;
  font-size: 0.8rem;

  .on-left {
    font-size: 1.4rem;
    margin-right: 0.5rem;
  }
}
</style>
