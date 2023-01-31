<template>
  <base-modal
    ref="modal"
    v-bind="$attrs"
    :title="sent ? $t('send_device_modal.sent_title') : $attrs.title"
    v-on="$listeners"
  >
    <div v-if="sent" class="text-center">
      <base-icon name="check-circle-black" class="my-16" size="120" />
    </div>

    <slot :is-sent="sent" />

    <div v-if="!sent && devices.length" class="text-center">
      <p class="md:px-20 mb-5 text-gray-600">
        {{ $t('send_device_modal.description') }}
      </p>

      <h3 class="mb-5">
        {{ $t('send_device_modal.list_title') }}

        <base-icon
          name="reload"
          class="ml-4 text-2xl cursor-pointer text-gray-600 hover:text-gray-400 duration-200"
          @click="reloadDevices"
        />
      </h3>

      <div v-if="loading" class="text-xl mt-10">
        <base-spinner class="block mx-auto" />
      </div>

      <div v-else-if="failed || !devices.length" class="text-red">
        {{ $t('send_device_modal.failed_message') }}
      </div>

      <div v-else class="inline-block mx-auto">
        <base-radio-group
          v-model="selectedDeviceId"
          :items="devices"
          item-text="name"
          item-value="_id"
        />
      </div>
    </div>

    <template v-if="!sent" #actions>
      <base-button :inline="!!devices.length" lg @click="hide">
        <base-icon name="dismiss" class="text-2xl" />
      </base-button>

      <base-button
        v-if="devices.length"
        lg
        :disabled="failed || !selectedDeviceId"
        :loading="sending"
        class="flex-grow ml-5"
        @click="send"
      >
        <base-icon name="send" class="text-3xl" />
      </base-button>
    </template>
  </base-modal>
</template>

<script>
export default {
  inheritAttrs: false,
  data () {
    return {
      selectedDeviceId: null,
      loading: false,
      sending: false,
      sent: false,
      failed: false,
      devices: [],
      action: null,
      payload: null
    }
  },
  methods: {
    async show ({ action, payload }) {
      await this.reloadDevices()
      this.action = action
      this.payload = payload
      this.selectedDeviceId = null
      this.sent = this.failed = false
      this.$refs.modal?.show?.()
    },

    hide (...params) {
      this.$refs.modal?.hide?.(...params)
    },

    async reloadDevices () {
      this.loading = true
      this.failed = false
      this.devices = await this.$repos.gymDeviceRepo.getGymDevices(this.$auth.user._id)
        .then(devices => devices.filter(d => d['ws-status'] === 'online'))
      this.loading = false
    },

    async send () {
      if (!this.selectedDeviceId) {
        return
      }

      this.sending = true

      await Promise.all([].concat(this.payload).map(item => this.$repos.gymDeviceRepo.sendToDevice({
        action: this.action,
        gymId: this.$auth.user._id,
        deviceId: this.selectedDeviceId,
        data: item
      })))
        .then(() => {
          this.sent = true
        })
        .catch(() => {
          this.failed = true
        })

      this.sending = false
    }
  }
}
</script>
