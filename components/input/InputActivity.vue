<template>
  <div>
    <base-select
      v-bind="{
        ...$attrs,
        debounceDuration: 300,
        items: suggestedActivities,
        itemText: 'name',
        label: $t('global.activity'),
        tooltip: ' ',
        returnObject: true,
        value: null,
      }"
      v-on="$utils.except($listeners, 'input')"
      @search="keywords = $event"
      @item-select="onActivitySelected"
    />

    <cw-activity-modal ref="activityModal" @done="setActivity" />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {
  inheritAttrs: false,
  props: {
    value: { type: Object, default: null }
  },
  data () {
    return {
      keywords: ''
    }
  },
  computed: {
    ...mapState('calendar', ['activities']),
    suggestedActivities () {
      return this.activities
        .filter(activity =>
          activity.name.toLowerCase().match(this.keywords.toLowerCase())
        )
        .concat([
          {
            name: this.$t('global.new', { name: this.$t('global.activity') })
          }
        ])
    }
  },
  created () {
    if (this.activities.length < 1) { this.getActivities() }
  },
  methods: {
    ...mapActions('calendar', ['getActivities']),
    onActivitySelected (activity) {
      if (activity?._id) {
        this.setActivity(activity)
      } else {
        this.setActivity(null)
        this.$refs.activityModal.show()
      }
    },
    setActivity (activity = null) {
      this.$emit('input', activity)
      this.$attrs.listeners?.validated?.()
    }
  }
}
</script>
