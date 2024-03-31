<template>
  <div class="w-100 h-100" style="position: relative">
    <div class="w-100 h-100" ref="konvaEditor" style="position: absolute"></div>
    <v-toolbar density="compact" style="position: relative">
      <template v-slot:prepend>
        <v-btn icon="mdi-arrow-left" @click="close"></v-btn>
      </template>

      <v-btn icon="mdi-chart-line-variant" :color="colors[0]" @click="useDrawLineTool"> </v-btn>
      <v-btn icon="mdi-gesture" :color="colors[1]" @click="useDrawCurveTool"> </v-btn>
      <v-divider class="mx-3 align-self-center" length="24" thickness="2" vertical></v-divider>
      <v-btn icon="mdi-eraser" :color="colors[2]" @click="useEraserTool"> </v-btn>
      <v-btn icon="mdi-ray-start-vertex-end" :color="colors[3]" @click="useEditTool"> </v-btn>
      <v-btn icon="mdi-cursor-move" :color="colors[4]" @click="useMoveTool"> </v-btn>
      <v-divider class="mx-3 align-self-center" length="24" thickness="2" vertical></v-divider>
      <v-btn icon="mdi-magnify-plus" @click="zoomIn"> </v-btn>
      <!-- <v-btn icon="mdi-reply" @click="restoreZoom">
                  </v-btn> -->
      <v-btn icon="mdi-magnify-minus" @click="zoomOut"> </v-btn>
      <v-divider class="mx-3 align-self-center" length="24" thickness="2" vertical></v-divider>
      <v-btn icon="mdi-undo" @click="undo"> </v-btn>
      <v-btn icon="mdi-content-save-outline"></v-btn>
      <v-btn icon="mdi-redo" @click="redo"> </v-btn>

      <template v-slot:append>
        <v-btn icon="mdi-delete" @click="clear"></v-btn>
      </template>
    </v-toolbar>
  </div>
</template>

<script setup lang="ts">
import { DieEditorManager } from '@/model/manager/die-editor-manager'
import type { IDieDataDao } from '@/model/manager/models/idie-data-dao'
import { Tool } from '@/model/manager/tools/tool'
import { EmitHint } from 'typescript'
import { computed } from 'vue'
import { watch } from 'vue'
import { onBeforeUnmount } from 'vue'
import { onMounted } from 'vue'
import { ref } from 'vue'

const model = defineModel<IDieDataDao>();

const konvaEditor = ref()
const ro = new ResizeObserver(onResize)
const colors = ref<string[]>([])
let editor: DieEditorManager

const emit = defineEmits<{
  (e: 'close', data?: IDieDataDao): void
}>()

function onResize() {
  editor?.resize(konvaEditor)
}
function useEditTool() {
  editor.useTool(Tool.EDIT)
}
function useDrawLineTool() {
  editor.useTool(Tool.DRAW_LINE)
}
function useDrawCurveTool() {
  editor.useTool(Tool.DRAW_CURVE)
}
function useEraserTool() {
  editor.useTool(Tool.ERASER)
}
function useMoveTool() {
  editor.useTool(Tool.MOVE)
}
function zoomIn() {
  editor.zoomIn()
}
function zoomOut() {
  editor.zoomOut()
}
function undo() {
  //editor.undo()
}
function redo() {
  //editor.redo()
}
function clear() {
  editor.clear();
}
function close() {
  const dieDataDao = editor.getData();
  emit('close', dieDataDao)
}
function updateColors() {
  colors.value = [
    editor?.selectedTool == Tool.DRAW_LINE ? 'secondary' : '',
    editor?.selectedTool == Tool.DRAW_CURVE ? 'secondary' : '',
    editor?.selectedTool == Tool.ERASER ? 'secondary' : '',
    editor?.selectedTool == Tool.EDIT ? 'secondary' : '',
    editor?.selectedTool == Tool.MOVE ? 'secondary' : '',
  ];
}


onMounted(() => {
  editor = new DieEditorManager(konvaEditor)
  editor.onUseTool(updateColors)
  editor.useTool(Tool.DRAW_CURVE)
  if (model.value) editor.setData(model.value)

  ro.observe(konvaEditor.value)
})
onBeforeUnmount(() => {
  ro.unobserve(konvaEditor.value)
  editor.destroy();
})
</script>

<style scoped></style>
