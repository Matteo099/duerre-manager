<template>
  <v-card class="mx-auto px-5 pb-5 pt-2" color="surface-light" :subtitle="subtitle">
    <template v-slot:title>
      <span class="text-h3 font-weight-black" v-text="title"></span>
      <strong>{{ unit }}</strong>
    </template>
    <v-sheet color="transparent">
      <slot></slot>
    </v-sheet>
  </v-card>
</template>

<script setup lang="ts">
interface ChartFrameProps {
  title?: string
  subtitle?: string
  unit?: string
}

const props = defineProps<ChartFrameProps>()
</script>
