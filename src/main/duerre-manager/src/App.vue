<template>
  <v-app>
    <v-navigation-drawer permanent v-model="drawer">
      <v-list-item height="64">
        <template v-slot:prepend>
          <v-img contain :src="imageUrl" height="45" width="45"></v-img>
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
        <v-list-item to="/dashboard" color="lime-darken-4">
          <template v-slot:prepend>
            <v-icon icon="mdi-file-tree"></v-icon>
          </template>
          <v-list-item-title>Forme</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="grey-darken-4">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title style="margin-left: -10px">
        <router-link to="/">
          <v-img contain :src="imageUrlLogo" height="90" width="150"></v-img>
        </router-link>
      </v-app-bar-title>

      <v-btn @click="toggleTheme" icon class="mr-2">
        <v-icon right>mdi-theme-light-dark</v-icon>
      </v-btn>

      <v-tooltip location="bottom">
        <template v-slot:activator="{ props }">
          <v-avatar
            size="40"
            color="lime-darken-4"
            v-bind="props"
            key="Default"
            class="mr-2"
          >
            <span>{{ userInitials }}</span>
          </v-avatar>
        </template>
        <span>
          <v-list bg-color="surface-variant" v-if="userRoles.length > 0" density="compact">
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
      <!-- <v-btn class="mx-5" @click="logout" variant="outlined">
        menu.logout
        <v-icon right class="ml-2">mdi-logout</v-icon>
      </v-btn> -->
    </v-app-bar>

    <v-main>
      <v-container class="pa-0" fluid>
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import { useSettingsStore } from './stores/settings'

const settingsStore = useSettingsStore()
const theme = useTheme()
const imageUrl = new URL('@/assets/images/app_logo.png', import.meta.url).href
const imageUrlLogo = new URL('@/assets/images/company_logo.png', import.meta.url).href
const drawer = ref(true)
const userInitials = ref('AD')
const userRoles = ref(['ADMIN'])

function toggleTheme() {
  settingsStore.toggleDarkMode()
  theme.global.name.value =
    theme.global.name.value == 'myCustomDarkTheme' ? 'myCustomLightTheme' : 'myCustomDarkTheme'
}
</script>
