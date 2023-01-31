<template>
  <base-confirm-popup
    ref="confirm"
    :persistent="persistent"
    :dismissible="!persistent"
    :actions="[{ text: $t('global.update'), handler: update, bold: true }]"
  >
    <div class="text-center">
      {{ $t('calendar.location_capacity_popup.manage_max_places') }} {{ locationName }}
    </div>
    <base-input-text
      v-model.number="capacity"
      type="number"
      min="0"
      :placeholder="$t('calendar.location_capacity_popup.max_places.placeholder')"
      :label="$t('calendar.location_capacity_popup.max_places.label')"
      light
    />
  </base-confirm-popup>
</template>

<script>
export default {
  data: () => ({
    location: null,
    capacity: null
  }),
  computed: {
    persistent () {
      return this.location?.type === 'address' && this.location?.capacity === null
    },
    locationName () {
      if (!this.location) {
        return ''
      }

      return this.location.text
    }
  },
  methods: {
    show (location) {
      this.location = location
      const capacity = this.location.capacity
      if (capacity !== null && capacity !== undefined) {
        this.capacity = capacity
      }
      this.$refs.confirm.show()
    },
    update () {
      this.location.capacity = this.capacity
      Object.assign(this.$data, this.$options.data.call(this))
      this.$refs.confirm.hide()
    }
  }
}
</script>

<style lang="postcss" scoped>
::v-deep .base-confirm__container {
  width: 350px;
}

::v-deep .base-confirm__action {
  @apply uppercase;
}
</style>
