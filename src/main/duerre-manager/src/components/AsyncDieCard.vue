<template>
  <div v-if="error">
    <v-card
      class="mx-auto"
      max-width="300"
      subtitle="Impossibile caricare lo stampo"
      title="Stampo non trovato!"
      disabled
      link
    >
      <template v-slot:append>
        <v-icon color="error" icon="mdi-alert"></v-icon>
      </template>
    </v-card>
  </div>
  <DieCard style="margin-top: 0!important; margin-bottom: 0!important;" max-width="300" v-else-if="die" :die="die" />
  <v-skeleton-loader
    v-else
    class="mx-auto border"
    max-width="300"
    type="image, article"
  ></v-skeleton-loader>
</template>

<script setup lang="ts">
import { useHttp } from '@/plugins/http'
import DieCard from '@/components/DieCard.vue'
import { onMounted, ref, defineProps } from 'vue'
import Client from '@/plugins/http/openapi'
import { AxiosHeaders } from 'axios'

interface AsyncDieCard {
  id: string
}

const props = defineProps<AsyncDieCard>()
const die = ref<Client.Components.Schemas.Die>()
const http = useHttp()
const error = ref(false)

async function loadDie() {
  const client = await http.client
  const res = await client.getDie(props.id, null, {
    headers: new AxiosHeaders().set('skip-not-found', true)
  })

  if (res?.status == 200) {
    die.value = res.data
  } else error.value = true
}

onMounted(() => loadDie())
</script>
