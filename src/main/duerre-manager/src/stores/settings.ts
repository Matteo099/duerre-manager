import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state() {
    return {
      darkMode: false
    }
  },
  actions: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode
    }
  }
})
