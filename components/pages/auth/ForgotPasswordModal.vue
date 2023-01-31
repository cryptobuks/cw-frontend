<template>
  <base-modal
    ref="modal"
    :title="$t('forgot_pw.modal_title')"
    :disabled="
      !email && (!mobile || !mobile.countryCode || !mobile.phoneNumber) && !pin
    "
    height="600"
    save-icon="send"
    v-on="sent ? {} : { done: submit }"
    @hidden="reset(true)"
  >
    <template #activator="props">
      <slot v-bind="props" />
    </template>

    <div class="forgot-pw">
      <base-form v-if="!sent" v-slot="{ rules }" class="forgot-pw__form">
        <cw-forgot-password-option
          v-model="activeOption"
          name="email"
          :label="$t('contact_channel.email')"
          :description="$t('forgot_pw.email_description')"
          :error-message="$t('forgot_pw.email_invalid_msg')"
          :has-error="isInvalid"
        >
          <base-input-text
            v-model.trim="email"
            type="email"
            light
            :label="$t('contact_channel.email')"
            :rules="{ required: rules.required, syntax: rules.email }"
            hide-error
            @error:syntax="isInvalid = true"
            @validation-reset="isInvalid = false"
          />
        </cw-forgot-password-option>

        <cw-forgot-password-option
          v-model="activeOption"
          name="sms"
          :label="$t('contact_channel.sms')"
          :description="$t('forgot_pw.sms_description')"
          :error-message="$t('forgot_pw.sms_invalid_msg')"
          :has-error="isInvalid"
        >
          <cw-input-phone
            v-model="mobile"
            :rules="{
              required: () =>
                !!(mobile && mobile.countryCode && mobile.phoneNumber) ||
                $t('validation.required'),
            }"
            light
            hide-error
            @error="isInvalid = true"
            @validation-reset="isInvalid = false"
          />
        </cw-forgot-password-option>

        <cw-forgot-password-option
          v-model="activeOption"
          name="pin"
          :label="$t('forgot_pw.pin_label')"
          :description="$t('forgot_pw.pin_description')"
          :error-message="$t('forgot_pw.pin_invalid_msg')"
          :has-error="isInvalid"
        >
          <base-input-text
            v-model.trim="pin"
            :label="$t('forgot_pw.pin_label')"
            :placeholder="$t('forgot_pw.pin_placeholder')"
            :rules="[rules.required]"
            light
          />
        </cw-forgot-password-option>
      </base-form>

      <div v-else class="forgot-pw__sent">
        <div class="mb-12">
          <span class="forgot-pw__sent__check-icon" />
        </div>

        <h4 class="forgot-pw__sent__title">
          {{
            $t(
              `forgot_pw.sent_${
                activeOption === "email"
                  ? "email"
                  : activeOption === "sms"
                    ? "sms"
                    : "pin"
              }`
            )
          }}
        </h4>

        <p v-if="activeOption === 'email'" class="forgot_pw__sent__description">
          {{ $t(`forgot_pw.sent_email_description`) }}
        </p>

        <div v-else-if="activeOption === 'pin' && gymsName" class="text-center pt-1">
          {{ gymsName }}
        </div>
      </div>
    </div>
  </base-modal>
</template>

<script>
export default {
  data () {
    return {
      activeOption: null,
      email: null,
      mobile: null,
      pin: null,
      isInvalid: false,
      sent: false,
      gymsName: ''
    }
  },
  watch: {
    activeOption: 'reset'
  },
  mounted () {
    if (this.$route?.query?.forgot) {
      this.$refs.modal.show()
    }
  },
  methods: {
    submit () {
      let promise

      switch (this.activeOption) {
        case 'email':
          promise = this.$repos.authRepo.resetPasswordByEmail(this.email)
          break
        case 'sms':
          promise = this.$repos.authRepo.resetPasswordByMobile(this.mobile)
          break
        case 'pin':
          promise = this.$repos.authRepo.resetPasswordByPin(this.pin)
            .then((res) => {
              this.gymsName = res.data?.gyms?.map(g => g.displayName || g.brand).join(', ')
              return res
            })
          break
      }

      promise && promise
        .then((res) => {
          this.sent = res && res.success
          this.isInvalid = !this.sent
        })
    },

    reset (hard = false) {
      if (hard === true) {
        this.activeOption = null
        this.sent = false
      }
      this.gymsName = ''
      this.email = this.pin = null
      this.mobile = {
        countryCode: null,
        prefixNumber: null,
        phoneNumber: null
      }
      this.isInvalid = false
    }
  }
}
</script>

<style lang="scss">
.forgot-pw {
  padding: 48px 16px 0;

  &__sent {
    text-align: center;

    &__check-icon {
      height: 120px;
      width: 120px;
      @apply inline-block relative bg-white rounded-1/2;

      &:before {
        content: "";
        position: absolute;
        left: 45px;
        top: 20px;
        width: 35px;
        height: 70px;
        border-style: solid;
        border-width: 0 6px 6px 0;
        transform: rotate(45deg);

        @apply border-black;
      }
    }

    &__title {
      font-size: 20px;
      padding-top: 16px;
      margin-bottom: 48px;
    }

    &__description {
      color: rgba(#fff, 0.75);
      padding-top: 16px;
    }
  }
}
</style>
