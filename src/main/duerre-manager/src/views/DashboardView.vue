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

    <div class="text-center pb-6">
      <v-pagination v-model="page" :length="total" rounded="circle" :total-visible="4"
        @update:model-value="goToPage"></v-pagination>
    </div>

    <v-fab color="success" icon="mdi-plus" size="64" to="/create-die" fixed app appear></v-fab>
  </div>
</template>

<script setup lang="ts">
import AdvancedSearch from '@/components/AdvancedSearch.vue'
import DieCard from '@/components/DieCard.vue'
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'
import { onMounted, ref } from 'vue'

const http = useHttp()

const dies = ref<Client.Components.Schemas.Die[]>([])
const allDies: Client.Components.Schemas.Die[] = []
const searchedDies: Client.Components.Schemas.Die[] = []
let diesToPaginate: Client.Components.Schemas.Die[] = [];
const page = ref(1);
const total = ref(0);
const itemsPerPage = 12;

function randomAlias(): string[] {
  const length = Math.floor(Math.random() * 5)
  return Array.from({ length }, (x, i) => 'alias' + i)
}
async function loadDies() {
  const client = await http.client
  const res = await client.listDies()
  console.log(res)

  if (res.status == 200) {
    allDies.length = 0;
    allDies.push(...res.data)
    total.value = Math.ceil(allDies.length / itemsPerPage);
    diesToPaginate = allDies;
    if (page.value == 1) goToPage(1)
    else page.value = 1;
  }
}
async function searchDies(dieSearchDao: Client.Components.Schemas.DieSearchDao) {
  const client = await http.client
  const res = await client.searchDies(null, dieSearchDao)
  console.log(res)

  if (res.status == 200) {
    searchedDies.length = 0;
    searchedDies.push(...res.data);
    total.value = Math.ceil(searchedDies.length / itemsPerPage);
    diesToPaginate = searchedDies;
    if (page.value == 1) goToPage(1)
    else page.value = 1;
  }
}
function reset() {
  diesToPaginate = allDies;
  total.value = Math.ceil(allDies.length / itemsPerPage);
  if (page.value == 1) goToPage(1)
  else page.value = 1;
}

function goToPage(page: number) {
  console.log("goToPage " + page)
  const start = (page - 1) * itemsPerPage
  const end = start + itemsPerPage
  dies.value = diesToPaginate.slice(start, end)
}

onMounted(() => loadDies())
</script>
