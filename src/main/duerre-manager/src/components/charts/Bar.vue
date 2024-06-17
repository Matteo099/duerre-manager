<template>
  <div class="size" ref="chartdiv"></div>
</template>

<script setup lang="ts">
import * as am5 from '@amcharts/amcharts5'
import * as am5percent from '@amcharts/amcharts5/percent'
import * as am5xy from '@amcharts/amcharts5/xy'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
interface GaugeProps {
  value: { id: string; count: number }[]
}

const value = defineProps<GaugeProps>()
const chartdiv = ref<HTMLElement | null>(null)
let root: am5.Root
let series: am5xy.ColumnSeries
let xAxis: am5xy.CategoryAxis<am5xy.AxisRenderer>

watch(value, () => {
  updateChart()
})

function setupChart() {
  root = am5.Root.new(chartdiv.value!)

  root.setThemes([am5themes_Animated.new(root)])

  let chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: 'panX',
      wheelY: 'zoomX',
      pinchZoomX: true,
      paddingLeft: 0,
      paddingRight: 1
    })
  )

  let cursor = chart.set('cursor', am5xy.XYCursor.new(root, {}))
  cursor.lineY.set('visible', false)

  // Create axes
  // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
  let xRenderer = am5xy.AxisRendererX.new(root, {
    minGridDistance: 30,
    minorGridEnabled: true
  })

  xRenderer.labels.template.setAll({
    rotation: -90,
    centerY: am5.p50,
    centerX: am5.p100,
    paddingRight: 15
  })

  xRenderer.grid.template.setAll({
    location: 1
  })

  xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      maxDeviation: 0.3,
      categoryField: 'id',
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    })
  )

  let yRenderer = am5xy.AxisRendererY.new(root, {
    strokeOpacity: 0.1
  })

  let yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation: 0.3,
      renderer: yRenderer
    })
  )

  // Create series
  // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
  series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: 'Series 1',
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: 'count',
      sequencedInterpolation: true,
      categoryXField: 'id',
      tooltip: am5.Tooltip.new(root, {
        labelText: '{valueY}'
      })
    })
  )

  series.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5, strokeOpacity: 0 })
  series.columns.template.adapters.add('fill', function (fill, target) {
    return chart.get('colors')?.getIndex(series.columns.indexOf(target))
  })

  series.columns.template.adapters.add('stroke', function (stroke, target) {
    return chart.get('colors')?.getIndex(series.columns.indexOf(target))
  })

  updateChart()

  // Make stuff animate on load
  // https://www.amcharts.com/docs/v5/concepts/animations/
  series.appear(1000)
  chart.appear(1000, 100)
}

function updateChart() {
  xAxis.data.setAll(value.value)
  series.data.setAll(value.value)
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
