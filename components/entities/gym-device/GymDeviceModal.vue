<template>
  <base-modal
    ref="modal"
    :title="$t('global.manage') + ' ' + (entityName || $t('entities.gym_device'))"
    :disabled="!draft.name"
    :loading="saving"
    @done="save"
  >
    <base-form v-slot="{ rules }">
      <base-input-text
        v-model="draft.name"
        :label="$t('gym_device.name.label')"
        :placeholder="$t('gym_device.name.placeholder')"
        :tooltip="$t('gym_device.name.tooltip')"
        :rules="{
          required: rules.required,
          unique: checkGymDeviceNameUniqueness
        }"
        @blur="entityName = draft._id ? entityName : draft.name"
      />

      <template v-if="gymDeviceUrl">
        <base-qr-code
          :text="gymDeviceUrl"
          :logo="logo"
          class="my-8 md:my-12 lg:my-16 xl:my-20 h-64"
        />

        <p v-html="$t('gym_device.instruction')" />
      </template>
    </base-form>
  </base-modal>
</template>

<script>
export default {
  props: {
    gymId: { type: String, default: '' },
    devices: { type: Array, default: () => [] },
    logo: { type: String, default: null }
  },
  data () {
    return {
      draft: {
        name: '',
        status: 'toBeActivated'
      },
      entityName: null,
      saving: false
    }
  },
  computed: {
    gymDeviceUrl () {
      return this.draft._id
        ? `${location.origin}/device?deviceId=${this.draft._id}&gymId=${this.gymId}&status=${this.draft.status.toLowerCase()}`
        : null
    }
  },
  methods: {
    show (entity) {
      this.draft = this.$utils.extract(entity, {
        _id: undefined,
        status: 'toBeActivated',
        name: ''
      })
      this.entityName = entity?.name || null
      this.$refs.modal.show()
    },
    checkGymDeviceNameUniqueness (name) {
      const id = this.draft._id
      return !name ||
        !this.devices.find(d => d._id !== id && d.name === name) ||
        this.$t('gym_device.name.validation.unique')
    },
    async save () {
      this.saving = true
      await this.$store.dispatch('gym-device/mutateGymDevice', {
        gymId: this.gymId,
        ...this.draft
      })
      this.$refs.modal.hide()
      this.saving = false
    }
  }
}
</script>
