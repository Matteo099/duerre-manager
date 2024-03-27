<template>
  <v-card :loading="loading" class="mx-auto my-12">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear
        :active="isActive"
        color="deep-purple"
        height="4"
        indeterminate
      ></v-progress-linear>
    </template>

    <v-img height="250" :src="image" cover></v-img>

    <v-card-item>
      <v-card-title>{{ name }}</v-card-title>

      <v-card-subtitle>
        <span class="me-1">{{ customer }}</span>

        <v-icon color="error" icon="mdi-face-agent" size="small"></v-icon>
      </v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <v-row align="center" class="mx-0">
        <v-rating
          :model-value="4.5"
          color="amber"
          density="compact"
          size="small"
          half-increments
          readonly
        ></v-rating>

        <div class="text-grey ms-4">4.5 (413)</div>
      </v-row>

      <div class="my-4 text-subtitle-1">$ • Italian, Cafe</div>

      <div v-if="alias">{{ alias }}</div>
      <div v-else>Nessun alias presente</div>
    </v-card-text>

    <v-divider class="mx-4 mb-1"></v-divider>

    <div class="text-center">
      <v-chip class="ma-2" color="indigo" prepend-icon="mdi-invert-colors">MONOCOLORE</v-chip>
      <v-chip class="ma-2" color="success" prepend-icon="mdi-material-ui">PVC</v-chip>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { FncWorker } from '@/model/fnc-worker'
import { useHttp } from '@/plugins/http'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export interface DieCardProp {
  name: string
  imageSrc?: string
  customer: string
  aliases?: string[]
}
const http = useHttp()

const loading = ref(true)
const props = defineProps<DieCardProp>()
const image = ref(props.imageSrc)
const alias = computed(() => {
  return props.aliases?.join(', ') || ''
})
let worker: FncWorker

function loadImage() {
  let now = new Date().getTime()
  const target = now + Math.floor(Math.random() * 3000)
  let s = target - now
  let c = 0
  // console.log(s)
  while (target - now > 0) {
    now = new Date().getTime()
    // some computation...
    for (let index = 0; index < Math.random() * 10000; index++) {
      c += index ^ (2 * Math.random())
    }
  }
  // console.log('before return')
  return { s, c, v: 'https://cdn.vuetifyjs.com/images/cards/cooking.png' }
}

onMounted(() => {
  worker = new FncWorker(loadImage)
  worker.promise.then((res) => {
    loading.value = false
    image.value = res.v
    // console.log(res)
  })
})
onBeforeUnmount(() => {
  worker?.terminate()
})
</script>
