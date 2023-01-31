<template>
  <base-confirm-popup
    ref="confirm"
    title="Choose the rooms to add"
    :actions="[{ text: $t('global.add'), handler: add, bold: true }]"
  >
    <div class="space-y-3 mb-3">
      <div v-for="room in rooms" :key="room._id" class="flex items-center">
        <div class="flex items-center flex-1">
          <base-checkbox v-model="selectedRoomIds" :value="room._id">
            <base-icon v-if="room.type === 'virtual'" name="wifi" />
            <span>{{ room.name }}</span>
          </base-checkbox>
          <base-icon class="ml-2" name="person" size="14" />
          <input type="number" :value="room.capacity.adult" class="w-8 text-center rounded-none leading-none border-b border-black ml-2">
        </div>
        <!-- <div class="font-semibold">
          <span class="text-sea-green">32</span>
          <span>/32</span>
        </div> -->
      </div>
    </div>
  </base-confirm-popup>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: () => ({
    excludedRoomIds: [],
    selectedRoomIds: []
  }),
  computed: {
    ...mapState('calendar', ['gymAssets']),
    rooms () {
      // convert to dictionary for faster lookup
      const excludedIds = {}

      this.excludedRoomIds.forEach((id) => {
        excludedIds[id] = true
      })

      return this.gymAssets.filter(asset => !excludedIds[asset._id])
    }
  },
  methods: {
    show (excludedRoomIds) {
      // reset state
      Object.assign(this.$data, this.$options.data.call(this))

      this.excludedRoomIds = excludedRoomIds

      this.$refs.confirm.show()
    },
    add () {
      if (this.selectedRoomIds.length) {
        this.$emit('add', this.selectedRoomIds)
        this.$refs.confirm.hide()
      }
    }
  }
}
</script>

<style lang="postcss" scoped>
.text-sea-green {
  color: #86cf9e;
}

::v-deep .base-confirm__container {
  width: 350px;
}
</style>
