<template>
  <base-main-card
    v-slot="{ items }"
    v-bind="$attrs"
    :title="this.$t('profile.entities.gym_devices')"
    show-search-toggler
    :actions="disabled ? [] : [{ icon: 'add', handler: showModal }]"
    :items="devices"
    :item-text="device => device.name"
    :hide-search="false"
    :body-class="!loading ? 'bg-white p-4' : ''"
    v-on="$listeners"
  >
    <cw-gym-device-modal
      ref="modal"
      :gym-id="profile._id"
      :logo="logo"
      :devices="devices"
    />

    <base-card-loading v-if="loading" />
    <div v-else-if="items.length > 0">
      <cw-gym-device-swipe-card
        v-for="device in items"
        :key="device._id"
        :device="device"
        :hide-actions="disabled"
        :gym-id="profile._id"
        :logo="logo"
        class="mb-3"
        @edit="showModal(device)"
        @reset="resetGymDevice({ _id: device._id, gymId: profile._id })"
        @remove="confirmRemoveDevice(device)"
      />
    </div>
    <base-card-no-data v-else />
  </base-main-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  inheritAttrs: false,
  props: {
    profile: { type: Object, required: true }
  },
  data: () => ({ loading: true }),
  computed: {
    ...mapState('gym-device', ['devices']),
    disabled () {
      // TODO enable for operator role
      const authUserId = this.$auth.user._id
      return (
        this.profile._id !== authUserId &&
        !!this.profile.directors?.every(d => d.id !== authUserId)
      )
    },
    logo () {
      return this.$utils.getAvatarUrl(this.profile?.avatar)
    }
  },
  async created () {
    await this.getGymDevices(this.profile._id)
    this.loading = false
  },
  methods: {
    ...mapActions('gym-device', [
      'getGymDevices',
      'removeGymDevice',
      'resetGymDevice'
    ]),
    showModal (device) {
      this.$refs.modal.show(device)
    },
    confirmRemoveDevice (device) {
      this.$confirm(
        this.$t('gym_device.remove_confirmation', { deviceName: device.name }),
        () => {
          this.removeGymDevice({
            _id: device._id,
            gymId: this.profile._id
          })
        }
      )
    }
  }
}
</script>
