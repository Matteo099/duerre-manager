<template>
  <div class="size" ref="chartdiv"></div>
</template>

<script setup lang="ts">
import * as am5 from '@amcharts/amcharts5'
import * as am5radar from '@amcharts/amcharts5/radar'
import * as am5xy from '@amcharts/amcharts5/xy'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Animation } from '@amcharts/amcharts5/.internal/core/util/Entity'
interface GaugeProps {
  value: number
}

const value = defineProps<GaugeProps>()
const chartdiv = ref<HTMLElement | null>(null)
let root: am5.Root
let axisDataItem: am5.DataItem<am5xy.IValueAxisDataItem>

watch(value, () => {
  updateChart()
})

function setupChart() {
  root = am5.Root.new(chartdiv.value!)

  root.setThemes([am5themes_Animated.new(root)])

  let chart = root.container.children.push(
    am5radar.RadarChart.new(root, {
      panX: false,
      panY: false,
      startAngle: 180,
      endAngle: 360
    })
  )

  let axisRenderer = am5radar.AxisRendererCircular.new(root, {
    innerRadius: -10,
    strokeOpacity: 1,
    strokeWidth: 15,
    strokeGradient: am5.LinearGradient.new(root, {
      rotation: 0,
      stops: [
        { color: am5.color(0x19d228) },
        { color: am5.color(0xf4fb16) },
        { color: am5.color(0xf6d32b) },
        { color: am5.color(0xfb7116) }
      ]
    })
  })

  // Create X-Axis
  let xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation: 0,
      min: 0,
      max: 100,
      strictMinMax: true,
      renderer: axisRenderer
    })
  )

  // Add clock hand
  // https://www.amcharts.com/docs/v5/charts/radar-chart/gauge-charts/#Clock_hands
  axisDataItem = xAxis.makeDataItem({})
  axisDataItem.set('value', value.value)

  let bullet = axisDataItem.set(
    'bullet',
    am5xy.AxisBullet.new(root, {
      sprite: am5radar.ClockHand.new(root, {
        pinRadius: am5.percent(20),
        radius: am5.percent(99),
        bottomWidth: 20
      })
    })
  )

  let label = chart.radarContainer.children.push(
    am5.Label.new(root, {
      fill: am5.color(0xffffff),
      centerX: am5.percent(50),
      textAlign: 'center',
      centerY: am5.percent(50),
      fontSize: '3em'
    })
  )
  bullet.get('sprite').on('rotation', () => {
    let value = axisDataItem.get('value') ?? 0
    let text = Math.round(value).toString()
    label.set('text', text)
  })

  xAxis.createAxisRange(axisDataItem)
  
  updateChart();

  axisDataItem.get('grid')?.set('visible', false)
  chart.appear(1000, 100)
}

let lastAnimation: Animation<number | undefined>

function updateChart() {
  if (lastAnimation) {
    lastAnimation.stop()
  }
  lastAnimation = axisDataItem.animate({
    key: 'value',
    to: value.value,
    duration: 800,
    easing: am5.ease.out(am5.ease.cubic)
  })
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
