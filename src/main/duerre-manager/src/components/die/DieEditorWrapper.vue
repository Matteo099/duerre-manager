<template>
  <div class="text-center pa-4" v-if="dialog">
    <v-dialog v-model="visibility" transition="dialog-bottom-transition" fullscreen>
      <v-card>
        <DieEditor v-model="model" @close="close" />
      </v-card>
    </v-dialog>
  </div>

  <DieEditor v-model="model" v-else />
</template>

<script setup lang="ts">
import { inject } from 'vue';
import DieEditor from './DieEditor.vue';
import { ref } from 'vue';
import type { IDieDataDao } from '@/model/manager/models/idie-data-dao';

const model = defineModel<IDieDataDao>();

interface DieEditorProps {
  dialog?: boolean
}

const props = withDefaults(defineProps<DieEditorProps>(), {
  dialog: true
})
const emit = defineEmits(['close', 'visible'])
const visible = inject("visible", false)
const visibility = ref(visible);

function close(data?: IDieDataDao) {
  model.value = data;
  visibility.value = false
  emit('close', data)
}
</script>
