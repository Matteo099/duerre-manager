<template>
  <div class="size" ref="chartdiv"></div>
</template>

<script setup lang="ts">
import * as am5 from '@amcharts/amcharts5'
import * as am5xy from '@amcharts/amcharts5/xy'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const chartdiv = ref<HTMLElement | null>(null)
let root: any

function setupChart() {
  root = am5.Root.new(chartdiv.value!)

  root.setThemes([am5themes_Animated.new(root)])

  let chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panY: false,
      layout: root.verticalLayout
    })
  )

  let data = [
    { deviceName: 'Root Device A', value: Math.random() * 100 },
    { deviceName: 'Root Device B', value: Math.random() * 100 },
    { deviceName: 'Root Device C', value: Math.random() * 100 },
    { deviceName: 'Root Device D', value: Math.random() * 100 },
    { deviceName: 'Root Device E', value: Math.random() * 100 },
    { deviceName: 'Root Device F', value: Math.random() * 100 },
    { deviceName: 'Root Device G', value: Math.random() * 100 }
  ]

  // Create Y-axis
  let yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    })
  )

  // Create X-Axis
  let xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      renderer: am5xy.AxisRendererX.new(root, {}),
      categoryField: 'deviceName'
    })
  )
  xAxis.data.setAll(data)

  // Create series
  let series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: 'SLA',
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: 'value',
      categoryXField: 'deviceName',
      tooltip: am5.Tooltip.new(root, {
        labelText: '{valueY}'
      })
    })
  )
  series.data.setAll(data)

  // Add legend
  let legend = chart.children.push(am5.Legend.new(root, {}))
  legend.data.setAll(chart.series.values)

  // Add cursor
  chart.set('cursor', am5xy.XYCursor.new(root, {}))

  series.appear(1000)
  chart.appear(1000, 100)
}

onBeforeUnmount(() => root?.dispose())

onMounted(() => setupChart())
</script>

<style scoped>
.size {
  width: 100%;
  aspect-ratio: 1/1;
}
</style>
