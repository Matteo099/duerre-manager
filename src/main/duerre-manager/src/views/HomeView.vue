<template>
  <p>TODO...</p>

  <v-row>
    <p>n Card per ogni ordine in corso</p>
  </v-row>

  if segretaria || operaio || admin
  <v-row>
    Trend ordini:
    <p>gauge numero di ordini totali</p>
    <p>pie chart numero ordini completati, da fare, annullati...</p>
    <p>top 10 ordini (i più richiesti) nell'ultimo settimana/mese/anno</p>
    <p></p>
  </v-row>

  if operaio || admin
  <v-row>
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

  if admin
  <v-row>
    <v-col cols="4" class="pa-10">
      <ChartFrame title="CPU" subtitle="Utilizzo CPU istantaneo">
        <Gauge :value="cpu" />
      </ChartFrame>
    </v-col>
    <v-col cols="4" class="pa-10">
      <ChartFrame title="RAM" subtitle="Utilizzo RAM istantaneo">
        <Gauge :value="ram" />
      </ChartFrame>
    </v-col>
    <v-row>
      <v-col cols="auto" class="pa-10" v-for="hdd in hdds">
        <ChartFrame :title="hdd.description" subtitle="Utilizzo HDD istantaneo">
          <Percentage :value="hdd.usage?.toString() ?? ''" unit="%" />
        </ChartFrame>
      </v-col>
    </v-row>
  </v-row>

  <p></p>
</template>

<script setup lang="ts">
import ChartFrame from '@/components/charts/ChartFrame.vue'
import Percentage from '@/components/charts/Percentage.vue'
import Gauge from '@/components/charts/Gauge.vue'
import { onMounted, ref, type Ref } from 'vue'
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi'

const cpu = ref(0)
const ram = ref(0)
const hdds = ref<Client.Components.Schemas.Metric[]>([])
const http = useHttp()

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
    hdds.value = res.data ?? [] //Math.round(Math.random() * 100)
    console.log(res.data)
  }
}

onMounted(() => {
  setInterval(() => updateCharts(), 2500)
})
</script>
