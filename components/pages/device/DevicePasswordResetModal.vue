<template>
  <base-modal
    ref="modal"
    :title="$t('device_password_modal.title')"
    :disabled="!password"
    :loading="resetting"
    save-icon="reset-password"
    @done="resetPassword"
    @hidden="$emit('hidden')"
  >
    <cw-input-password
      ref="input"
      v-model="password"
      :clearable="false"
      strict
    />
  </base-modal>
</template>

<script>
export default {
  data () {
    return {
      password: null,
      resetting: false,
      profile: null
    }
  },
  methods: {
    show (profile) {
      if (!profile?._id) {
        return
      }

      this.profile = this.$utils.extract(profile, [{ from: '_id', to: 'profileId' }, 'dob'])
      this.password = null
      this.resetting = false

      this.$refs.modal.show()
    },

    async resetPassword () {
      if (this.$refs.input.validate()) {
        this.resetting = true
        if (await this.$repos.gymDeviceRepo.resetPassword({ ...this.profile, password: this.password })) {
          this.$notifier.success('Reset password successfully')
          this.$refs.modal.hide()
        }
        this.resetting = false
      }
    }
  }
}
</script>
