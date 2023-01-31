<template>
  <base-swipe-card
    :actions="actions"
    :hide-actions="$attrs['hide-actions'] || detailShown"
    bg-color="#fff"
    auto-height
    horizontal-actions
    container-class="text-black"
    class="gym-device-swipe-card"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div
      class="flex items-center w-full -m-1 pr-4"
      :class="{ 'cursor-pointer': !detailShown }"
      @click="showDetail"
    >
      <div v-if="!detailShown" class="flex-shrink-0 w-15 h-15 mr-2 select-none">
        <img src="~/assets/icons/qr-code.svg" class="h-full w-full">
      </div>

      <div class="flex-grow overflow-hidden">
        <h4 class="font-semibold mb-1">
          {{ device.name }}
        </h4>

        <div v-if="device.status === 'toBeActivated'" class="text-xs text-gray-600">
          {{ $t('gym_device.status.toBeActivated') }}
        </div>

        <div
          v-else
          class="text-xs"
          :class="[device['ws-status'] === 'online' ? 'text-green' : 'text-red']"
        >
          {{ $t('gym_device.status.' + device['ws-status']) }}
        </div>
      </div>
    </div>

    <template v-if="detailShown">
      <span
        class="absolute top-0 right-0 w-10 h-10 inline-flex justify-center items-center cursor-pointer"
        @click="hideDetail"
      >
        <base-icon name="chevron-down" />
      </span>

      <base-qr-code :text="gymDeviceUrl" :logo="logo" class="mt-4 mb-6 h-64" />

      <p v-html="$t('gym_device.instruction')" />
    </template>
  </base-swipe-card>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    device: { type: Object, required: true },
    gymId: { type: String, default: '' },
    logo: { type: String, default: null }
  },
  data: () => ({
    detailShown: false
  }),
  computed: {
    actions () {
      return [
        { icon: 'pen', handler: () => this.$emit('edit') },
        ...(this.status === 'connected' ? [{ icon: 'unlink', secondary: true, handler: () => this.$emit('reset') }] : []),
        { icon: 'bin', danger: true, handler: () => this.$emit('remove') }
      ]
    },

    gymDeviceUrl () {
      return this.device._id
        ? `${location.origin}/device?deviceId=${this.device._id}&gymId=${this.gymId}&status=${this.status}`
        : null
    },
    status () {
      return this.device.status?.toLowerCase?.() || ''
    }
  },
  methods: {
    showDetail () {
      if (!this.detailShown) {
        this.detailShown = true
      }
    },
    hideDetail () {
      this.detailShown = false
    }
  }
}
</script>

<style lang="scss">
.gym-device-swipe-card {
  opacity: 1 !important;

  @apply shadow;
}
</style>
