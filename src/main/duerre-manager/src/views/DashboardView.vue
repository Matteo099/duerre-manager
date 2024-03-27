<template>
  <div class="ma-4">
    <v-row no-gutters>
      <v-col cols="12">
        <AdvancedSearch />
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col v-for="n in 10" :key="n" cols="12" md="4" class="px-2">
        <DieCard :name="n.toString()" :aliases="randomAlias()" customer="CustomerA" />
        <!-- <v-sheet class="ma-2 pa-2">{{ generateRandomText(1, 4) }}</v-sheet> -->
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import DieCard from '@/components/DieCard.vue'
import AdvancedSearch from '@/components/AdvancedSearch.vue'
import { useHttp } from '@/plugins/http'
import { onMounted } from 'vue'
import { toast } from 'vue3-toastify'

const http = useHttp()

function randomAlias(): string[] {
  const length = Math.floor(Math.random() * 5)
  return Array.from({ length }, (x, i) => 'alias' + i)
}
async function test() {
  const client = await http.client
  const customers = await client.listCustomers()
  console.log(customers)
}

onMounted(() => test())
</script>
