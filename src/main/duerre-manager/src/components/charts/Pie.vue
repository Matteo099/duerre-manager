<template>
  <div class="size" ref="chartdiv"></div>
</template>

<script setup lang="ts">
import * as am5 from '@amcharts/amcharts5'
import * as am5percent from '@amcharts/amcharts5/percent'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
interface GaugeProps {
  value: { id?: string; count?: number }[]
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
      valueField: 'count',
      categoryField: 'id',
      endAngle: 270
    })
  )

  series.states.create('hidden', {
    endAngle: -90
  })

  // Create modal for a "no data" note
  let modal = am5.Modal.new(root, {
    content: 'Nessun dato disponibile'
  })

  series.events.on('datavalidated', function (ev) {
    let series = ev.target
    if (ev.target.data.length < 1) {
      // Generate placeholder data
      let categoryField = series.get('categoryField')!
      let valueField = series.get('valueField')!
      let placeholder = []
      for (let i = 0; i < 3; i++) {
        let item: any = {}
        item[categoryField] = ''
        item[valueField] = 1
        placeholder.push(item)
      }
      series.data.setAll(placeholder)

      // Disable ticks/labels
      series.labels.template.set('forceHidden', true)
      series.ticks.template.set('forceHidden', true)

      // Show modal
      modal.open()
    } else {
      // Re-enable ticks/labels
      series.labels.template.set('forceHidden', false)
      series.ticks.template.set('forceHidden', false)

      // Hide modal
      modal.close()
    }
  })

  updateChart()

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
