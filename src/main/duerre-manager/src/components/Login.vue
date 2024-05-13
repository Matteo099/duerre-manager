<template>
  <v-row class="h-screen" align="center" justify="center" dense>
    <v-col cols="12" md="6" align-self="center">
      <v-card
        v-for="user in userHandler.users"
        class="mx-auto my-10"
        color="primary"
        variant="tonal"
        :prepend-icon="user.icon"
        :subtitle="user.getDescription()"
        :title="user.fullName"
        @click="selectUser(user)"
        link
      ></v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { CompleteUser, userHandler } from '@/model/role'

const emit = defineEmits<{
  (e: 'onSelectUser', user: CompleteUser): void
}>()

function selectUser(user: CompleteUser) {
  emit('onSelectUser', user)
}
</script>
