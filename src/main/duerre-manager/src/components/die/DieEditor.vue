<template>
  <div class="w-100 h-100" style="position: relative">
    <div class="w-100 h-100" ref="konvaEditor" style="position: absolute"></div>
    <v-toolbar density="compact" style="position: relative">
      <template v-slot:prepend>
        <v-btn icon="mdi-arrow-left" v-if="canClose" @click="close"></v-btn>
      </template>

      <v-btn
        icon="mdi-chart-line-variant"
        v-if="canDrawLine"
        :color="colors[0]"
        @click="useDrawLineTool"
      >
      </v-btn>
      <v-btn icon="mdi-gesture" v-if="canDrawCurve" :color="colors[1]" @click="useDrawCurveTool">
      </v-btn>
      <v-divider
        class="mx-3 align-self-center"
        v-if="canDrawLine || canDrawCurve"
        length="24"
        thickness="2"
        vertical
      ></v-divider>
      <v-btn icon="mdi-eraser" v-if="canErase" :color="colors[2]" @click="useEraserTool"> </v-btn>
      <v-btn icon="mdi-ray-start-vertex-end" v-if="canEdit" :color="colors[3]" @click="useEditTool">
      </v-btn>
      <v-btn icon="mdi-cursor-move" v-if="canMove" :color="colors[4]" @click="useMoveTool"> </v-btn>
      <v-btn icon="mdi-knife" v-if="canCut" :color="colors[5]" @click="useCutTool"></v-btn>
      <v-btn icon="mdi-select-off" v-if="canDeselectTool" @click="deselectTool"> </v-btn>
      <v-divider
        class="mx-3 align-self-center"
        v-if="canErase || canEdit || canMove || canCut || canDeselectTool"
        length="24"
        thickness="2"
        vertical
      ></v-divider>
      <v-btn icon="mdi-magnify-plus" @click="zoomIn"> </v-btn>
      <!-- <v-btn icon="mdi-reply" @click="restoreZoom">
                  </v-btn> -->
      <v-btn icon="mdi-magnify-minus" @click="zoomOut"> </v-btn>
      <v-divider
        class="mx-3 align-self-center"
        v-if="canSaveUndoRedo"
        length="24"
        thickness="2"
        vertical
      ></v-divider>
      <v-btn icon="mdi-undo" v-if="canUndo" @click="undo"> </v-btn>
      <v-btn icon="mdi-content-save-outline" v-if="canSave"></v-btn>
      <v-btn icon="mdi-redo" v-if="canRedo" @click="redo"> </v-btn>

      <template v-slot:append>
        <v-btn icon="mdi-delete" v-if="canClear" @click="clear"></v-btn>
      </template>
    </v-toolbar>
  </div>
</template>

<script setup lang="ts">
import { DieEditorManager } from '@/model/manager/die-editor-manager'
import type { IDieDataDao } from '@/model/manager/models/idie-data-dao'
import { Tool } from '@/model/manager/tools/tool'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { toast } from 'vue3-toastify'

interface DieEditorProps {
  tools?: Tool[]
  canClose?: boolean
  canUndo?: boolean
  canSave?: boolean
  canRedo?: boolean
  canClear?: boolean
  canDeselectTool?: boolean
}

let editor: DieEditorManager
const model = defineModel<IDieDataDao>()
const konvaEditor = ref()
const ro = new ResizeObserver(onResize)
const colors = ref<string[]>([])
const props = withDefaults(defineProps<DieEditorProps>(), {
  canClose: true,
  canUndo: true,
  canSave: true,
  canRedo: true,
  canClear: true,
  canDeselectTool: true,
  tools: () => [Tool.DRAW_LINE, Tool.DRAW_CURVE, Tool.EDIT, Tool.ERASER, Tool.MOVE, Tool.CUT]
})
const canDrawLine = computed(() => props.tools.includes(Tool.DRAW_LINE))
const canDrawCurve = computed(() => props.tools.includes(Tool.DRAW_CURVE))
const canErase = computed(() => props.tools.includes(Tool.ERASER))
const canEdit = computed(() => props.tools.includes(Tool.EDIT))
const canMove = computed(() => props.tools.includes(Tool.MOVE))
const canCut = computed(() => props.tools.includes(Tool.CUT))
const canSaveUndoRedo = computed(() => props.canSave || props.canUndo || props.canRedo)

const emit = defineEmits<{
  (e: 'close', data?: IDieDataDao): void
}>()

function onResize() {
  editor?.resize(konvaEditor)
}
function useEditTool() {
  useTool(Tool.EDIT)
}
function useDrawLineTool() {
  useTool(Tool.DRAW_LINE)
}
function useDrawCurveTool() {
  useTool(Tool.DRAW_CURVE)
}
function useEraserTool() {
  useTool(Tool.ERASER)
}
function useMoveTool() {
  useTool(Tool.MOVE)
}
function useCutTool() {
  useTool(Tool.CUT)
}
function useTool(tool: Tool) {
  const res = editor.useTool(tool)
  if (!res.value) {
    const msg = 'Non puoi utilizzare questo strumento'
    toast.warn(res.message ? `${msg}: ${res.message}` : `${msg}!`, { autoClose: 10000 })
  }
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
  editor.clear()
}
function close() {
  const dieDataDao = editor.getData()
  emit('close', dieDataDao)
}
function deselectTool() {
  editor.useTool()
}
function updateColors() {
  colors.value = [
    editor?.selectedTool == Tool.DRAW_LINE ? 'secondary' : '',
    editor?.selectedTool == Tool.DRAW_CURVE ? 'secondary' : '',
    editor?.selectedTool == Tool.ERASER ? 'secondary' : '',
    editor?.selectedTool == Tool.EDIT ? 'secondary' : '',
    editor?.selectedTool == Tool.MOVE ? 'secondary' : '',
    editor?.selectedTool == Tool.CUT ? 'secondary' : ''
  ]
}
function loadDieData() {
  console.log('loadDieData', model.value)
  if (model.value) editor.setData(model.value)
}

onMounted(() => {
  editor = new DieEditorManager(konvaEditor)
  editor.onUseTool(updateColors)
  // editor.useTool(Tool.DRAW_CURVE)
  loadDieData()

  ro.observe(konvaEditor.value)
})
onBeforeUnmount(() => {
  ro.unobserve(konvaEditor.value)
  editor.destroy()
})
</script>

<style scoped></style>
