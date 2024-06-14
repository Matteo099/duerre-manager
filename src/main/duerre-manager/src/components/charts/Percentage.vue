<template>
  <div class="text-center pa-5">
    <span class="text-h3 font-weight-black">
      {{ value.value }}
    </span>
    <strong>{{ unit }}</strong>
  </div>
</template>

<script setup lang="ts">
interface PercentageProps {
  value: string
  unit?: string
}

const value = defineProps<PercentageProps>()

</script>