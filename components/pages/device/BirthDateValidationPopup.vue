<template>
  <base-confirm-popup
    ref="popup"
    :title="verifyDobFailed ? $t('dob_validation_popup.fail_title') : popupTitle"
    :actions="[{ icon: 'send', handler: validateDob }]"
    :hide-actions="verifyDobFailed"
    overlay
    persistent
    @active-change="!$event && onHidden()"
  >
    <div v-if="verified && verifyDobFailed">
      {{ errorMessage }}
    </div>

    <base-form v-else-if="!verified" v-slot="{ rules }">
      <div class="mb-8">
        {{ $t('dob_validation_popup.description') }}
      </div>

      <base-input-date
        ref="input"
        v-model="dob"
        :label="$t('dob_validation_popup.label')"
        :tooltip="$t('dob_validation_popup.tooltip')"
        :rules="{ required: rules.required }"
        initial-view="year"
        :initial-year-ago="25"
        light
      />
    </base-form>
  </base-confirm-popup>
</template>

<script>
export default {
  data () {
    return {
      dob: null,
      correctDob: null,
      verified: false,
      verifyDobFailed: false,
      popupTitle: null,
      errorMessage: null,
      timeout: null,
      onDone () {}
    }
  },
  methods: {
    show ({ dob, title, onDone, errorMessage } = null) {
      this.dob = null
      this.correctDob = dob
      this.popupTitle = title
      this.onDone = onDone
      this.verifyDobFailed = this.verified = false
      this.errorMessage = errorMessage

      this.$refs.popup.show()
    },

    async validateDob () {
      if (await this.$refs.input.validate()) {
        this.verified = true

        const verifyDobFailed = !this.$dayjs(this.dob).isSame(this.$dayjs(this.correctDob))

        if (verifyDobFailed) {
          setTimeout(() => {
            this.verifyDobFailed = true

            this.timeout = setTimeout(() => {
              if (!this.verifyDobFailed) {
                return
              }

              this.$refs.popup?.hide?.()
            }, 10000)
          })
        } else {
          this.$refs.popup?.hide?.()
        }
      }

      return false
    },

    onHidden () {
      clearTimeout(this.timeout)
      this.verified && !this.verifyDobFailed && this.onDone?.()
      this.$emit(!this.verified || this.verifyDobFailed ? 'fail' : 'done')
    }
  }
}
</script>
