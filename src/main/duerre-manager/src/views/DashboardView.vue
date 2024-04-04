<template>
  <div class="ma-4">
    <v-row no-gutters>
      <v-col cols="12">
        <AdvancedSearch :search-dies="searchDies" @reset="reset" />
      </v-col>
    </v-row>

    <!-- <v-row no-gutters>
      <v-col v-for="n in 10" :key="n" cols="12" md="4" class="px-2">
        <DieCard :name="n.toString()" :aliases="randomAlias()" customer="CustomerA" :to="'/die/' + n" />
        <v-sheet class="ma-2 pa-2">{{ generateRandomText(1, 4) }}</v-sheet>
      </v-col>
    </v-row> -->

    <v-row no-gutters>
      <v-col v-for="die in dies" :key="die.name" cols="12" md="4" class="px-2">
        <DieCard :die="die" :to="'/die/' + die.name" />
      </v-col>
    </v-row>

    <v-fab color="success" icon="mdi-plus" size="64" to="/create-die" fixed app appear></v-fab>
  </div>
</template>

<script setup lang="ts">
import AdvancedSearch from '@/components/AdvancedSearch.vue'
import DieCard from '@/components/DieCard.vue'
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'
import { all } from 'axios'
import { ref } from 'vue'
import { onMounted } from 'vue'

const http = useHttp()

const dies = ref<Client.Components.Schemas.Die[]>([])
const allDies: Client.Components.Schemas.Die[] = []

function randomAlias(): string[] {
  const length = Math.floor(Math.random() * 5)
  return Array.from({ length }, (x, i) => 'alias' + i)
}
async function loadDies() {
  const client = await http.client
  const res = await client.listDies()
  console.log(res)

  if (res.status == 200) {
    dies.value = res.data
    allDies.length = 0;
    allDies.push(...dies.value)
  }
}
async function searchDies(dieSearchDao: Client.Components.Schemas.DieSearchDao) {
  const client = await http.client
  const res = await client.searchDies(null, dieSearchDao)
  console.log(res)

  if (res.status == 200) {
    dies.value = res.data
  }
}
function reset() {
  dies.value = [...allDies]
}

onMounted(() => loadDies())
</script>
