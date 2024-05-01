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
      <div v-if="die.textScore || die.sizeScore || die.matchScore || die.totalScore">
        <div class="d-flex align-center flex-column my-auto">
          <div class="text-h2 mt-5 mb-3">
            {{ percentage(die.totalScore, maxTotalScore, 2) }}
            <span class="text-h6 ml-n3">/100</span>
          </div>

          <v-progress-linear bg-color="surface-variant" class="mb-6" color="primary" height="10" max="100"
            :model-value="percentage(die.totalScore, maxTotalScore, 2)" rounded="pill"></v-progress-linear>
        </div>

        <v-list bg-color="transparent" class="d-flex flex-column-reverse" density="compact">
          <v-list-item v-for="rating, i in ratings" :key="i">
            <v-progress-linear :model-value="rating.score" class="mx-n5" color="yellow-darken-3" height="20"
              rounded></v-progress-linear>

            <template v-slot:prepend>
              <!-- <span>{{ rating.name }}</span> -->
              <v-icon class="mx-3" :icon="rating.icon"></v-icon>
            </template>

            <template v-slot:append>
              <div class="rating-values">
                <span class="d-flex justify-end"> {{ rating.score }} </span>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </div>
      <div v-else-if="alias">{{ alias }}</div>
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
import { CoreUtils } from '@/model/editor/core/core-utils';
import type { IDieShapeImport } from '@/model/editor/core/shape/model/idie-shape-import';
import { useHttp } from '@/plugins/http';
import Client from '@/plugins/http/openapi';
import { computed, onMounted, ref, watch } from 'vue';

export interface DieCardProp {
  die: Client.Components.Schemas.Die | Client.Components.Schemas.CompleteDieSearchResult,
  maxTotalScore?: number
  maxTextScore?: number
  maxSizeScore?: number
  maxMatchScore?: number
}
const http = useHttp()

const loading = ref(true)
const props = defineProps<DieCardProp>()
const image = ref("https://cdn.vuetifyjs.com/images/cards/docks.jpg")
const alias = computed(() => {
  return props.die.aliases?.join(', ') || ''
})
const ratings = [
  { name: "S", icon: "mdi-shape", score: percentage(props.die.matchScore ?? 0, props.maxMatchScore, 2), },
  { name: "D", icon: "mdi-tape-measure", score: percentage(props.die.sizeScore ?? 0, props.maxSizeScore, 2), },
  { name: "T", icon: "mdi-format-text", score: percentage(props.die.textScore ?? 0, props.maxTextScore, 2), },
];

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

function percentage(value?: number, total?: number, precision?: number): string | number | undefined {
  if (value == undefined) return 0;
  const p = value * 100 / (total || 1);
  return precision == undefined ? p : p.toFixed(precision);
}

onMounted(() => {
  calculateImage();
})
</script>
