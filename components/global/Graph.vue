<template>
  <div v-bind="$attrs" />
</template>

<script>
import * as echarts from 'echarts/core'
import { BarChart, PictorialBarChart } from 'echarts/charts'
import 'echarts/lib/chart/line'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  PictorialBarChart,
  BarChart,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer
])
const INIT_TRIGGERS = ['theme', 'initOptions', 'autoresize']
const REWATCH_TRIGGERS = ['manualUpdate', 'watchShallow']
export default {
  props: {
    options: {
      type: Object,
      default: () => {}
    },
    theme: { type: [String, Object], default: '' },
    initOptions: { type: Object, default: () => ({}) },
    watchShallow: Boolean,
    manualUpdate: Boolean
  },
  data () {
    return {
      lastArea: 0
    }
  },
  created () {
    this.initOptionsWatcher()
    INIT_TRIGGERS.forEach((prop) => {
      this.$watch(
        prop,
        () => {
          this.refresh()
        },
        { deep: true }
      )
    })
    REWATCH_TRIGGERS.forEach((prop) => {
      this.$watch(prop, () => {
        this.initOptionsWatcher()
        this.refresh()
      })
    })
  },
  mounted () {
    // auto init if `options` is already provided
    if (this.options) {
      this.init()
    }
  },
  methods: {
    // just delegates ECharts methods to Vue component
    init (options) {
      if (this.chart) {
        return
      }
      const chart = echarts.init(this.$el, this.theme, this.initOptions)
      chart.setOption(
        options || this.manualOptions || this.options || {},
        true
      )
      this.chart = chart
    },
    initOptionsWatcher () {
      if (this.__unwatchOptions) {
        this.__unwatchOptions()
        this.__unwatchOptions = null
      }
      if (!this.manualUpdate) {
        this.__unwatchOptions = this.$watch(
          'options',
          (val, oldVal) => {
            if (!this.chart && val) {
              this.init()
            } else {
              // mutating `options` will lead to merging
              // replacing it with new reference will lead to not merging
              // eg.
              // `this.options = Object.assign({}, this.options, { ... })`
              // will trigger `this.chart.setOption(val, true)
              // `this.options.title.text = 'Trends'`
              // will trigger `this.chart.setOption(val, false)`
              this.chart.setOption(val, val !== oldVal)
            }
          },
          { deep: !this.watchShallow }
        )
      }
    },
    destroy () {
      this.chart = null
    },
    refresh () {
      if (this.chart) {
        this.destroy()
        this.init()
      }
    }
  },
  graphic: echarts.graphic
}
</script>
