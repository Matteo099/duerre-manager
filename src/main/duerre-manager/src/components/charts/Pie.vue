<template>
  <div class="size" ref="chartdiv"></div>
</template>

<script setup lang="ts">
import * as am5 from '@amcharts/amcharts5'
import * as am5percent from '@amcharts/amcharts5/percent'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
interface GaugeProps {
  value: { category: string; value: number }[]
}

const value = defineProps<GaugeProps>()
const chartdiv = ref<HTMLElement | null>(null)
let root: am5.Root
let series: am5percent.PieSeries

watch(value, () => {
  updateChart()
})

function setupChart() {
  root = am5.Root.new(chartdiv.value!)

  root.setThemes([am5themes_Animated.new(root)])

  let chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      endAngle: 270
    })
  )

  series = chart.series.push(
    am5percent.PieSeries.new(root, {
      valueField: 'value',
      categoryField: 'category',
      endAngle: 270
    })
  )

  series.states.create('hidden', {
    endAngle: -90
  })

  updateChart();

  series.appear(1000, 100)
}

function updateChart() {
  series.data.setAll(value.value)
}

onBeforeUnmount(() => root?.dispose())

onMounted(() => setupChart())
</script>

<style scoped>
.size {
  width: 100%;
  aspect-ratio: 2/1;
}
</style>
