import { Role, User, userHandler } from '@/model/role'
import { defineStore } from 'pinia'

const USER_KEY = "USER";

export const useSettingsStore = defineStore('settings', {
  state() {
    return {
      darkMode: false,
      user: undefined
    } as {
      darkMode: boolean,
      user: User | undefined
    }
  },
  actions: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode
    },
    setUser(user: User) {
      this.user = user;
      window.localStorage.setItem(USER_KEY, User[user]);
    },
    clearUser() {
      this.user = undefined;
      window.localStorage.removeItem(USER_KEY);
    },
    isLogged(): boolean {
      return !!window.localStorage.getItem(USER_KEY);
    },
    getUser() {
      const user = window.localStorage.getItem(USER_KEY);
      if (user) {
        return User[user as keyof typeof User];
      }
    },
    hasRole(role: Role) {
      const user = this.getUser();
      const cp = userHandler.getCompleteUser(user);
      return cp?.hasRole(role);
    },
  },
})
