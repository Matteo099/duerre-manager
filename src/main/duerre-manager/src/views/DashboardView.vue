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

    <v-row no-gutters v-if="loading">
      <v-col v-for="i in 3" :key="i" cols="12" md="4" class="px-2">
        <v-skeleton-loader :elevation="3" type="card"></v-skeleton-loader>
      </v-col>
    </v-row>
    <v-row no-gutters v-else-if="dies.length != 0">
      <v-col v-for="die in dies" :key="die.name" cols="12" md="4" class="px-2">
        <DieCard :die="die" :to="'/die/' + die.name" 
        :maxTotalScore="maxTotalScore"
        :maxTextScore="maxTextScore"
        :maxSizeScore="maxSizeScore"
        :maxMatchScore="maxMatchScore"  />
      </v-col>
    </v-row>
    <p class="text-center text-h5" v-else>Nessuno stampo trovato!</p>


    <div v-if="total > 0" class="text-center pb-6">
      <v-pagination v-model="page" :length="total" rounded="circle" :total-visible="4"
        @update:model-value="goToPage"></v-pagination>
    </div>

    <v-fab color="success" icon="mdi-plus" size="64" to="/create-die" fixed app appear></v-fab>
  </div>
</template>

<script setup lang="ts">
import AdvancedSearch from '@/components/AdvancedSearch.vue'
import DieCard from '@/components/DieCard.vue'
import { delay } from '@/model/utils'
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'
import { onMounted, ref } from 'vue'

const http = useHttp()

const dies = ref<(Client.Components.Schemas.Die | Client.Components.Schemas.CompleteDieSearchResult)[]>([])
const allDies: Client.Components.Schemas.Die[] = []
const searchedDies: Client.Components.Schemas.CompleteDieSearchResult[] = []
let diesToPaginate: Client.Components.Schemas.Die[] = []
const page = ref(1);
const total = ref(0);
const itemsPerPage = 12;
const loading = ref(false);
const maxTotalScore = ref(0);
const maxTextScore = ref(0);
const maxSizeScore = ref(0);
const maxMatchScore = ref(0);

function randomAlias(): string[] {
  const length = Math.floor(Math.random() * 5)
  return Array.from({ length }, (x, i) => 'alias' + i)
}
async function loadDies() {
  loading.value = true;
  const client = await http.client
  const res = await client.listDies()
  console.log(res)
  await delay(500)

  if (res.status == 200) {
    allDies.length = 0;
    allDies.push(...res.data)
    total.value = Math.ceil(allDies.length / itemsPerPage);
    diesToPaginate = allDies;
    if (page.value == 1) goToPage(1)
    else page.value = 1;
  }

  loading.value = false;
}
async function searchDies(dieSearchDao: Client.Components.Schemas.DieSearchDao) {
  loading.value = true;
  const client = await http.client
  const res = await client.searchDies(null, dieSearchDao)
  console.log(res)

  if (res.status == 200) {
    searchedDies.length = 0;
    searchedDies.push(...res.data);
    maxTotalScore.value = 0;
    maxTextScore.value = 0;
    maxSizeScore.value = 0;
    maxMatchScore.value = 0;
    for (const die of searchedDies) {
      maxTotalScore.value = Math.max(maxTotalScore.value, die.totalScore ?? 0);
      maxTextScore.value = Math.max(maxTextScore.value, die.textScore ?? 0);
      maxSizeScore.value = Math.max(maxSizeScore.value, die.sizeScore ?? 0);
      maxMatchScore.value = Math.max(maxMatchScore.value, die.matchScore ?? 0);
    }
    total.value = Math.ceil(searchedDies.length / itemsPerPage);
    diesToPaginate = searchedDies;
    if (page.value == 1) goToPage(1)
    else page.value = 1;
  }

  loading.value = false;
}
function reset() {
  diesToPaginate = allDies;
  total.value = Math.ceil(allDies.length / itemsPerPage);
  if (page.value == 1) goToPage(1)
  else page.value = 1;
}

function goToPage(page: number) {
  const start = (page - 1) * itemsPerPage
  const end = start + itemsPerPage
  dies.value = diesToPaginate.slice(start, end)
}

onMounted(() => loadDies())
</script>
