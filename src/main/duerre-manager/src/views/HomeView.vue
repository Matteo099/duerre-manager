<template>
  <v-container fluid>
    <p>TODO...</p>

    <v-row>
      <p>n Card per ogni ordine in corso</p>
    </v-row>

    <v-row v-if="hasRole(Role.HANDLE_ORDER)" class="justify-center">
      <v-col>
        <ChartFrame title="Ordini Totali" subtitle="Numero totale degli ordini presenti sulla piattaforma">
          <TextChart :value="totalOrdersCount.toString()" />
        </ChartFrame>
      </v-col>
      <v-col>
        <ChartFrame title="Divisione Ordini" subtitle="Divisione degli ordini in base allo stato">
          <Pie :value="orders" />
        </ChartFrame>
      </v-col>
      <v-col>
        <ChartFrame title="Top Ordini" subtitle="Ordini più richiesti">
          <Bar :value="topOrders" />
        </ChartFrame>
      </v-col>
      <!-- Trend ordini:
    <p>gauge numero di ordini totali</p>
    <p>pie chart numero ordini completati, da fare, annullati...</p>
    <p>top 10 ordini (i più richiesti) nell'ultimo settimana/mese/anno</p> -->
    </v-row>

    <v-row v-if="hasRole(Role.HANDLE_DIE)" class="justify-center">
      <v-col>
        <ChartFrame title="Stampi Totali" subtitle="Numero totale degli stampi">
          <TextChart :value="totalDiesCount.toString()" />
        </ChartFrame>
      </v-col>

      <v-col>
        <ChartFrame title="Divisione Stampi per Materiale"
          subtitle="Divisione degli stampi in base al materiale utilizzato">
          <Pie :value="diesByMaterial" />
        </ChartFrame>
      </v-col>

      <v-col>
        <ChartFrame title="Divisione Stampi per Colore" subtitle="Divisione degli stampi in base al colore">
          <Pie :value="diesByColor" />
        </ChartFrame>
      </v-col>
      <!-- Trend Stampi:
      <p>gauge numero di stampi totali</p>
      <p>pie chart numero stampi per materiale/per colore</p>
      <p>gauge numero di stampi creati negli ultimi 7 giorni</p> -->

    </v-row>

    <v-row v-if="hasRole(Role.HANDLE_APP)" class="justify-center align-center">
      <v-col cols="4">
        <ChartFrame title="CPU" subtitle="Utilizzo % CPU istantaneo">
          <Gauge :value="cpu" />
        </ChartFrame>
      </v-col>

      <v-col cols="4">
        <ChartFrame title="RAM" subtitle="Utilizzo % RAM istantaneo">
          <Gauge :value="ram" />
        </ChartFrame>
      </v-col>

      <v-col>
        <v-col v-for="hdd in hdds" class="ma-2">
          <ChartFrame :title="hdd.description" subtitle="Utilizzo % HDD">
            <TextChart :value="(((hdd.usage ?? 1) * 100) / (hdd.max ?? 1)).toFixed(2) ?? ''" unit="%" />
          </ChartFrame>
        </v-col>
      </v-col>
    </v-row>

    <p></p>
  </v-container>
</template>

<script setup lang="ts">
import ChartFrame from '@/components/charts/ChartFrame.vue'
import Gauge from '@/components/charts/Gauge.vue'
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'
import { Role } from '@/model/role'
import { useSettingsStore } from '@/stores/settings'
import TextChart from '@/components/charts/TextChart.vue'
import Pie from '@/components/charts/Pie.vue'
import Bar from '@/components/charts/Bar.vue'

const http = useHttp()
const settingsStore = useSettingsStore()

const totalOrdersCount = ref<number>(0)
const orders = ref<Client.Components.Schemas.OrderAggregationResult[]>([])
const topOrders = ref<Client.Components.Schemas.OrderAggregationResult[]>([])
const totalDiesCount = ref<number>(0)
const diesByMaterial = ref<Client.Components.Schemas.OrderAggregationResult[]>([])
const diesByColor = ref<Client.Components.Schemas.OrderAggregationResult[]>([])
const cpu = ref(0)
const ram = ref(0)
const hdds = ref<Client.Components.Schemas.Metric[]>([])

let interval2S: number | undefined;
let interval1M: number | undefined;


async function updateMetric(metricFnc: any, metricVar: Ref<number>) {
  const res = await metricFnc()
  if (res?.status == 200) {
    metricVar.value = res.data?.usage ?? 0 //Math.round(Math.random() * 100)
    console.log(res.data)
  }
}

async function updateHdds(client: Client.Client) {
  const res = await client.getHDD()
  if (res?.status == 200) {
    hdds.value = res.data ?? []
    console.log(res.data)
  }
}

async function updateTotalOrdersCount(client: Client.Client) {
  const res = await client.getTotalOrdersCount()
  if (res?.status == 200) {
    totalOrdersCount.value = res.data ?? 0
    console.log(res.data)
  }
}

async function updateOrderDistribution(client: Client.Client) {
  const res = await client.getOrderDistribution()
  if (res?.status == 200) {
    orders.value = res.data ?? []
    console.log(res.data)
  }
}

async function updateTopOrders(client: Client.Client) {
  const res = await client.getTopOrders()
  if (res?.status == 200) {
    topOrders.value = res.data ?? []
    console.log(res.data)
  }
}

async function updateTotalDiesCount(client: Client.Client) {
  const res = await client.getTotalDiesCount()
  if (res?.status == 200) {
    totalDiesCount.value = res.data ?? 0
    console.log(res.data)
  }
}

async function updateDieDistributionByMaterial(client: Client.Client) {
  const res = await client.getDieDistributionByMaterial()
  if (res?.status == 200) {
    diesByMaterial.value = res.data ?? []
    console.log(res.data)
  }
}

async function updateDieDistributionByColor(client: Client.Client) {
  const res = await client.getDieDistributionByColor()
  if (res?.status == 200) {
    diesByColor.value = res.data ?? []
    console.log(res.data)
  }
}

async function updateCharts(performanceCharts: boolean) {
  const client = await http.client
  if (performanceCharts) {
    updateMetric(client.getCPU, cpu)
    updateMetric(client.getRAM, ram)
    updateHdds(client)
  } else {
    updateTotalOrdersCount(client);
    updateOrderDistribution(client);
    updateTopOrders(client);
    updateTotalDiesCount(client);
    updateDieDistributionByMaterial(client)
    updateDieDistributionByColor(client)
  }
}

function hasRole(role: Role) {
  return settingsStore.hasRole(role)
}

onBeforeUnmount(() => {
  clearInterval(interval2S);
  clearInterval(interval1M);
});

onMounted(() => {
  interval2S = setInterval(() => updateCharts(true), 2500)
  interval1M = setInterval(() => updateCharts(false), 60000)
})
</script>
