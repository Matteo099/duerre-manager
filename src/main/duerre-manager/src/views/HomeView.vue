<template>
  <p>TODO...</p>

  <v-row>
    <p>n Card per ogni ordine in corso</p>
  </v-row>

  <v-row v-if="hasRole(Role.HANDLE_ORDER)">
    <v-col cols="auto" class="pa-10">
      <ChartFrame
        title="Ordini Totali"
        subtitle="Numero totale degli ordini presenti sulla piattaforma"
      >
        <TextChart :value="(Math.random() * 100).toFixed()" />
      </ChartFrame>
    </v-col>
    <v-col cols="4" class="pa-10">
      <ChartFrame title="Divisione Ordini" subtitle="Divisione degli ordini in base allo stato">
        <Pie :value="orders" />
      </ChartFrame>
    </v-col>
    <v-col cols="4" class="pa-10">
      <ChartFrame title="Top Ordini" subtitle="Ordini più richiesti">
        <Bar :value="topOrders" />
      </ChartFrame>
    </v-col>
    <!-- Trend ordini:
    <p>gauge numero di ordini totali</p>
    <p>pie chart numero ordini completati, da fare, annullati...</p>
    <p>top 10 ordini (i più richiesti) nell'ultimo settimana/mese/anno</p> -->
  </v-row>

  <v-row v-if="hasRole(Role.HANDLE_DIE)">
    Trend Stampi:
    <p>gauge numero di stampi totali</p>
    <p>pie chart numero stampi per materiale/per colore</p>
    <p>gauge numero di stampi creati negli ultimi 7 giorni</p>

    <!-- <v-col cols="6" class="pa-10">
      <ChartFrame title="SLA Dispositivi" subtitle="Some other words about SLA Dispositivi">
        <RootDeviceSLA />
      </ChartFrame>
    </v-col> -->
  </v-row>

  <v-row v-if="hasRole(Role.HANDLE_APP)">
    <v-col cols="4" class="pa-10">
      <ChartFrame title="CPU" subtitle="Utilizzo % CPU istantaneo">
        <Gauge :value="cpu" />
      </ChartFrame>
    </v-col>

    <v-col cols="4" class="pa-10">
      <ChartFrame title="RAM" subtitle="Utilizzo % RAM istantaneo">
        <Gauge :value="ram" />
      </ChartFrame>
    </v-col>

    <v-row>
      <v-col cols="auto" class="pa-10" v-for="hdd in hdds">
        <ChartFrame :title="hdd.description" subtitle="Utilizzo % HDD">
          <TextChart
            :value="(((hdd.usage ?? 1) * 100) / (hdd.max ?? 1)).toFixed(2) ?? ''"
            unit="%"
          />
        </ChartFrame>
      </v-col>
    </v-row>
  </v-row>

  <p></p>
</template>

<script setup lang="ts">
import ChartFrame from '@/components/charts/ChartFrame.vue'
import Gauge from '@/components/charts/Gauge.vue'
import { onMounted, ref, type Ref } from 'vue'
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'
import { Role } from '@/model/role'
import { useSettingsStore } from '@/stores/settings'
import TextChart from '@/components/charts/TextChart.vue'
import Pie from '@/components/charts/Pie.vue'
import Bar from '@/components/charts/Bar.vue'

const http = useHttp()
const settingsStore = useSettingsStore()

const orders = ref([
  {
    category: 'Lithuania',
    value: 501.9
  },
  {
    category: 'Czechia',
    value: 301.9
  },
  {
    category: 'Ireland',
    value: 201.1
  },
  {
    category: 'Germany',
    value: 165.8
  },
  {
    category: 'Australia',
    value: 139.9
  },
  {
    category: 'Austria',
    value: 128.3
  },
  {
    category: 'UK',
    value: 99
  }
])
const topOrders = [
  {
    id: 'USA',
    count: 2025
  },
  {
    id: 'China',
    count: 1882
  },
  {
    id: 'Japan',
    count: 1809
  },
  {
    id: 'Germany',
    count: 1322
  },
  {
    id: 'UK',
    count: 1122
  },
  {
    id: 'France',
    count: 1114
  },
  {
    id: 'India',
    count: 984
  },
  {
    id: 'Spain',
    count: 711
  },
  {
    id: 'Netherlands',
    count: 665
  },
  {
    id: 'South Korea',
    count: 443
  },
  {
    id: 'Canada',
    count: 441
  }
]

const cpu = ref(0)
const ram = ref(0)
const hdds = ref<Client.Components.Schemas.Metric[]>([])

async function updateMetric(metricFnc: any, metricVar: Ref<number>) {
  const res = await metricFnc()
  if (res?.status == 200) {
    metricVar.value = res.data?.usage ?? 0 //Math.round(Math.random() * 100)
    console.log(res.data)
  }
}

async function updateCharts() {
  const client = await http.client
  await updateMetric(client.getCPU, cpu)
  await updateMetric(client.getRAM, ram)

  const res = await client.getHDD()
  if (res?.status == 200) {
    hdds.value = res.data ?? []
    console.log(res.data)
  }
}

function hasRole(role: Role) {
  return settingsStore.hasRole(role)
}

onMounted(() => {
  setInterval(() => updateCharts(), 2500)
})
</script>
