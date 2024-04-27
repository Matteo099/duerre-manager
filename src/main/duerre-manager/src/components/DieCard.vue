<template>
  <v-card :loading="loading" class="mx-auto my-12">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear :active="isActive" color="deep-purple" height="4" indeterminate></v-progress-linear>
    </template>

    <v-img height="250" :src="image" cover></v-img>

    <v-card-item>
      <v-card-title>{{ die.name }}</v-card-title>

      <v-card-subtitle>
        <span class="me-1">{{ die.customer?.name }}</span>

        <v-icon color="error" icon="mdi-face-agent" size="small"></v-icon>
      </v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <v-row align="center" class="mx-0">
        <v-rating :model-value="4.5" color="amber" density="compact" size="small" half-increments readonly></v-rating>

        <div class="text-grey ms-4">4.5 (413)</div>
      </v-row>

      <div class="my-4 text-subtitle-1">$ • Italian, Cafe</div>

      <div v-if="alias">{{ alias }}</div>
      <div v-else>Nessun alias presente</div>
    </v-card-text>

    <v-divider class="mx-4 mb-1"></v-divider>

    <div class="text-center">
      <v-chip class="ma-2 pa-2" color="indigo" prepend-icon="mdi-invert-colors">{{ die.dieType }}</v-chip>
      <v-chip class="ma-2 pa-2" color="success" prepend-icon="mdi-material-ui">{{ die.material }}</v-chip>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { useHttp } from '@/plugins/http'
import Client from '@/plugins/http/openapi';
import { watch } from 'vue';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { CoreUtils } from '@/model/editor/core/core-utils'
import type { IDieLine } from '@/model/editor/core/shape/model/idie-line';
import type { IDieShapeImport } from '@/model/editor/core/shape/model/idie-shape-import';

export interface DieCardProp {
  die: Client.Components.Schemas.Die
}
const http = useHttp()

const loading = ref(true)
const props = defineProps<DieCardProp>()
const image = ref("https://cdn.vuetifyjs.com/images/cards/docks.jpg")
const alias = computed(() => {
  return props.die.aliases?.join(', ') || ''
})

watch(
  props.die,
  () => calculateImage()
)

function calculateImage() {
  const data = props.die.dieData;
  if (data?.lines)
    image.value = CoreUtils.exportImage(data as IDieShapeImport, { border: 50 });
  else image.value = "https://cdn.vuetifyjs.com/images/cards/docks.jpg"

  loading.value = false
}

onMounted(() => {
  calculateImage();
})
onBeforeUnmount(() => {

})
</script>
