<template>
  <base-confirm-popup
    ref="popup"
    :title="isSent ? '' : $t('send_device_popup.title')"
    :actions="[
      { icon: 'send', handler: send, disabled: !selectedDeviceId, loading: sending, class: 'text-3xl' }
    ]"
    :hide-actions="isSent"
  >
    <div v-if="isSent" class="text-xl text-center text-gray-600">
      {{ $t('send_device_popup.sent', { deviceName: selectedDevice.name }) }}
    </div>

    <div v-else class="send-to-device__options">
      <base-radio-group
        v-model="selectedDeviceId"
        :items="devices"
        item-text="name"
        item-value="_id"
        item-class="mb-2"
        light
      />
    </div>
  </base-confirm-popup>
</template>

<script>
export default {
  data () {
    return {
      isSent: false,
      sending: false,
      selectedDeviceId: null,
      devices: [],
      action: null,
      payload: null
    }
  },
  computed: {
    selectedDevice () {
      return this.selectedDeviceId && this.devices.find(d => d._id === this.selectedDeviceId)
    }
  },
  methods: {
    async show ({ action, payload }) {
      this.action = action
      this.payload = payload
      this.isSent = this.sending = false
      this.selectedDeviceId = null

      this.devices = await this.$repos.gymDeviceRepo.getGymDevices(this.$auth.user._id)
        .then(devices => devices.filter(d => d['ws-status'] === 'online'))

      if (!this.devices) {
        return this.$notifier.success('No active device found')
      }

      this.$refs.popup.show()
    },

    async send () {
      if (!this.selectedDeviceId) {
        return
      }

      this.sending = true
      const success = await this.$repos.gymDeviceRepo.sendToDevice({
        gymId: this.$auth.user._id,
        deviceId: this.selectedDeviceId,
        action: this.action,
        data: this.payload
      })
      this.sending = false

      if (success) {
        this.isSent = true
        setTimeout(() => {
          this.$refs.popup.hide()
          this.$emit('done')
        }, 2500)
      } else {
        this.$refs.popup.hide()
        this.$emit('fail', this.$t('send_device_popup.fail_message'))
      }
    },

    onDissmiss () {
      this.$emit('fail', this.$t('send_device_popup.abort_message'))
    }
  }
}
</script>
