<template>
  <div class="text-center pa-5">
    <span class="text-h3 font-weight-black">
      {{ value.value }}
    </span>
    <strong>{{ unit }}</strong>
  </div>
</template>

<script setup lang="ts">
interface TextChartProps {
  value: string
  unit?: string
}

const value = defineProps<TextChartProps>()

</script>