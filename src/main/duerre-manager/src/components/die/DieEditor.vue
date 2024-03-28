<template>
  <div class="w-100 h-100" style="position: relative">
    <div class="w-100 h-100" ref="konvaEditor" style="position: absolute"></div>
    <v-toolbar density="compact" style="position: relative">
      <template v-slot:prepend>
        <v-btn icon="mdi-arrow-left" @click="close"></v-btn>
      </template>

      <v-btn icon="mdi-chart-line-variant" :color="lineToolColor" @click="useDrawLineTool"> </v-btn>
      <v-btn icon="mdi-gesture" @click="useDrawCurveTool"> </v-btn>
      <v-divider class="mx-3 align-self-center" length="24" thickness="2" vertical></v-divider>
      <v-btn icon="mdi-eraser" @click="useEraserTool"> </v-btn>
      <v-btn icon="mdi-ray-start-vertex-end" @click="useEditTool"> </v-btn>
      <v-btn icon="mdi-cursor-move" @click="useMoveTool"> </v-btn>
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
        <v-btn icon="mdi-delete"></v-btn>
      </template>
    </v-toolbar>
  </div>
</template>

<script setup lang="ts">
import { DieEditorManager } from '@/model/manager/die-editor-manager'
import { Tool } from '@/model/manager/tools/tool'
import { EmitHint } from 'typescript'
import { computed } from 'vue'
import { onBeforeUnmount } from 'vue'
import { onMounted } from 'vue'
import { ref } from 'vue'

const konvaEditor = ref()
const ro = new ResizeObserver(onResize)
let editor: DieEditorManager
const lineToolColor = computed(() => {
  return editor?.selectedTool == Tool.DRAW_LINE ? 'primary' : 'secondary'
})

const emit = defineEmits(['close'])

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
function close() {
  emit('close')
}

onMounted(() => {
  editor = new DieEditorManager(konvaEditor)
  editor.useTool(Tool.DRAW_CURVE)

  ro.observe(konvaEditor.value)
})
onBeforeUnmount(() => {
  ro.unobserve(konvaEditor.value)
})
</script>

<style scoped></style>
