<template>
  <v-app v-if="logged">
    <v-navigation-drawer permanent v-model="drawer">
      <v-list-item height="64">
        <template v-slot:prepend>
          <v-img contain :src="appLogo" height="45" width="45"></v-img>
        </template>
        <v-list-item-title class="text-h6 ml-3">Andromeda</v-list-item-title>
        <v-list-item-subtitle class="ml-3 pb-1">Duerre Manager</v-list-item-subtitle>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item to="/" color="lime-darken-4">
          <template v-slot:prepend>
            <v-icon icon="mdi-home"></v-icon>
          </template>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="hasRole(Role.HANDLE_DIE)" to="/dashboard" color="lime-darken-4">
          <template v-slot:prepend>
            <v-icon icon="mdi-file-tree"></v-icon>
          </template>
          <v-list-item-title>Forme</v-list-item-title>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <v-footer height="45" class="px-0">
          <v-row align-content="center" no-gutters class="text-caption">
            <v-col align-self="center" cols="7">
              <v-img :src="companyLogo" height="45" />
            </v-col>
            <v-col align-self="center" cols="1"></v-col>
            <v-col align-self="center" class="d-flex" cols="3">
              <v-icon start>mdi-alpha-v-circle</v-icon>
              <span>{{ appVersion }}</span>
            </v-col>
          </v-row>
        </v-footer>
      </template>
    </v-navigation-drawer>

    <v-app-bar color="grey-darken-4">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title style="margin-left: -10px">
        <!-- <router-link to="/">
          <v-img contain :src="companyLogo" height="90" width="150"></v-img>
        </router-link> -->
      </v-app-bar-title>

      <v-tooltip v-if="hasRole(Role.HANDLE_APP) && updateAvailable" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" @click="dialog = true" class="mr-2 text-none" icon>
            <v-badge color="warning" content="!">
              <v-icon>mdi-bell-outline</v-icon>
            </v-badge>
          </v-btn>
        </template>
        <span>Nuova versione disponibile</span>
      </v-tooltip>

      <v-btn @click="toggleTheme" icon class="mr-2">
        <v-icon right>mdi-theme-light-dark</v-icon>
      </v-btn>

      <v-tooltip location="bottom">
        <template v-slot:activator="{ props }">
          <v-avatar size="40" color="lime-darken-4" v-bind="props" key="Default" class="mr-2">
            <span>{{ userInitials }}</span>
          </v-avatar>
        </template>
        <span>
          <v-list
            bg-color="surface-variant"
            v-if="userRoles && userRoles.length > 0"
            density="compact"
          >
            <div v-for="(userRole, index) in userRoles" :key="index">
              <v-list-item prepend-icon="mdi-account-check">
                {{ userRole }}
              </v-list-item>
            </div>
          </v-list>
          <v-list v-else bg-color="surface-variant">
            <v-list-item prepend-icon="mdi-account-off"> No roles found </v-list-item>
          </v-list>
        </span>
      </v-tooltip>
      <v-btn class="mx-5" @click="logout" variant="outlined">
        esci
        <v-icon right class="ml-2">mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="pa-0" fluid>
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
  <Login v-else @on-select-user="onSelectUser" />

  <div class="text-center pa-4">
    <UpdateApp :new-app-version="newAppVersion" v-model="dialog" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import { useSettingsStore } from './stores/settings'
import UpdateApp from './components/UpdateApp.vue'
import { useHttp } from './plugins/http'
import Login from '@/components/Login.vue'
import { computed } from 'vue'
import { userHandler, type CompleteUser } from './model/role'
import { Role } from './model/role'

const settingsStore = useSettingsStore()
const theme = useTheme()
const appLogo = new URL('@/assets/images/app_logo.png', import.meta.url).href
const companyLogo = new URL('@/assets/images/company_logo.png', import.meta.url).href
const drawer = ref(true)
const userInitials = ref<string>()
const userRoles = ref<string[]>()
const appVersion = import.meta.env.VITE_APP_VERSION
const updateAvailable = ref(false)
const dialog = ref(false)
const http = useHttp()
const newAppVersion = ref(appVersion)
const logged = computed(() => userRoles.value && userRoles.value.length > 0)

function toggleTheme() {
  settingsStore.toggleDarkMode()
  theme.global.name.value =
    theme.global.name.value == 'myCustomDarkTheme' ? 'myCustomLightTheme' : 'myCustomDarkTheme'
}

async function checkForUpdates() {
  const client = await http.client
  const res = await client.checkForUpdates()

  if (res?.status == 200) {
    updateAvailable.value = res.data.available ?? false
    newAppVersion.value = res.data.version
  }
}

function onSelectUser(user: CompleteUser) {
  settingsStore.setUser(user.name)
  udpateRoles()
}

function udpateRoles() {
  const u = settingsStore.getUser()
  const cu = userHandler.getCompleteUser(u)
  userRoles.value = cu?.roles.map((r) => Role[r.role]) ?? []
  userInitials.value = cu?.fullName.charAt(0).toUpperCase() ?? ''
}

function logout() {
  settingsStore.clearUser()
  udpateRoles()
}

function hasRole(role: Role) {
  return settingsStore.hasRole(role)
}

onMounted(() => {
  checkForUpdates()
  udpateRoles()
})
</script>
