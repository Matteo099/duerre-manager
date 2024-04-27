<template>
  <div class="v-input--center-affix v-input--error">
    <v-card class="mx-auto" height="200" :image="image" width="200" :link="true" @click="edit">
      <v-container class="h-100" fluid>
        <v-row class="h-100" align="center" no-gutters>
          <v-col class="text-center">
            <v-icon color="success" icon="mdi-pencil"> </v-icon>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
    <div class="v-input__details">
      <div class="v-messages__message v-messages" role="alert">
        <span>{{ error }}</span>
      </div>
    </div>

    <teleport to="body">
      <DieEditorWrapper v-model="model" :dialog="true" @close="close" />
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { CoreUtils } from '@/model/editor/core/core-utils';
import type { IDieShapeExport } from '@/model/editor/core/shape/model/idie-shape-export';
import { onBeforeUnmount, onMounted, provide, ref, watch } from 'vue';
import DieEditorWrapper from './DieEditorWrapper.vue';

const defaultShape = new URL('@/assets/images/polygon.png', import.meta.url).href

const model = defineModel<IDieShapeExport>();
const props = withDefaults(defineProps<{ errorMessages?: string[] }>(), { errorMessages: () => [] as string[] })
const error = ref("");
const image = ref(defaultShape);

watch(
  () => props.errorMessages,
  () => error.value = props.errorMessages.length == 0 ? "" : props.errorMessages[0]
)
watch(
  model,
  () => calculateImage()
)
const visible = ref(false)
provide('visible', visible)

function edit() {
  console.log(props);
  console.log(props.errorMessages)
  visible.value = true
  console.log("onEdit", model.value, visible.value)
}

function close(data?: IDieShapeExport) {
  model.value = data;
  // console.log(props);
  // console.log(props.errorMessages)
  // console.log("close", model.value, visible.value);
}

function calculateImage() {
  if (model.value)
    image.value = CoreUtils.exportImage(model.value, { border: 50 });
  else image.value = defaultShape
}

onMounted(() => {
  calculateImage();
})
onBeforeUnmount(() => {
})
</script>
