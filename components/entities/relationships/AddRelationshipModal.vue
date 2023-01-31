<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.invite')} ${$t(`roles.${action.role}`)}`"
    :disabled="disabled"
    :loading="submitting"
    @done="done"
    @shown="reset"
  >
    <base-form
      v-if="!submitted"
      v-slot="{ rules }"
      class="register-modal"
      @submit="done"
    >
      <base-progressive-fields-container
        ref="fields"
        :fields="fields"
        :required-fields="[
          {
            fields: ['email', 'mobile'],
            message: $t('auth.validation.email_or_mobile'),
          },
        ]"
        :data="tmp"
        @can-save-change="disabled = !$event"
      >
        <template #name="{ inputAttrs }">
          <base-input-text
            v-model.trim="tmp.name"
            :label="$t('register.name.label')"
            maxlength="100"
            :rules="[rules.maxLength(100)]"
            v-bind="inputAttrs"
          />
        </template>

        <template #surName="{ inputAttrs }">
          <base-input-text
            v-model.trim="tmp.surName"
            :label="$t('register.surname.label')"
            maxlength="100"
            :rules="[rules.maxLength(100)]"
            v-bind="inputAttrs"
          />
        </template>

        <template #email="{ inputAttrs }">
          <cw-input-email v-model.trim="tmp.email" v-bind="inputAttrs">
            <template v-if="false" #error:unique>
              {{ $t("auth.email.validation.unique") }}:

              <span
                class="text-white uppercase underline cursor-pointer"
                @click="$refs.modal.hide()"
              >
                {{ $t("global.click_here") }}
              </span>

              {{ $t("auth.to_access_your_acc") }}
            </template>
          </cw-input-email>
        </template>

        <template #mobile="{ inputAttrs }">
          <cw-input-phone v-model="tmp.mobile" v-bind="inputAttrs">
            <template v-if="false" #error:unique>
              {{ $t("auth.mobile.validation.unique") }}:

              <span
                class="text-white uppercase underline cursor-pointer"
                @click="$refs.modal.hide()"
              >
                {{ $t("global.click_here") }}
              </span>

              {{ $t("auth.to_access_your_acc") }}
            </template>
          </cw-input-phone>
        </template>

        <template v-if="action.type === 'IN'" #gender="{ inputAttrs }">
          <cw-input-gender v-model="tmp.gender" v-bind="inputAttrs" />
        </template>

        <template v-if="action.type === 'IN'" #dob="{ inputAttrs }">
          <cw-input-birth-date
            v-model="tmp.dob"
            v-bind="inputAttrs"
            check-emancipation
          />
        </template>

        <template #pin="{ inputAttrs }">
          <cw-input-pin v-model="tmp.pin" v-bind="inputAttrs">
            <template v-if="false" #error:unique>
              {{ $t("auth.pin.validation.unique") }}:

              <span
                class="text-white uppercase underline cursor-pointer"
                @click="$refs.modal.hide()"
              >
                {{ $t("global.click_here") }}
              </span>

              {{ $t("auth.to_access_your_acc") }}
            </template>
          </cw-input-pin>
        </template>

        <template v-if="action.type === 'IN'" #address="{ inputAttrs }">
          <cw-input-address v-model="tmp.address" v-bind="inputAttrs" />
        </template>

        <template v-if="action.type === 'IN'" #documents>
          <base-checkbox v-model="termAgreed" square class="mb-6">
            {{ $t("auth.i_agree_to_the") }}

            <cw-terms-modal class="underline inline-block">
              {{ $t("auth.terms_n_conditions") }}
            </cw-terms-modal>
          </base-checkbox>

          <base-checkbox
            :checked="privacyAgreed"
            square
            class="mb-6"
            @change="onPrivacyAgreedChange"
          >
            {{ $t("auth.i_accept_the") }}

            <cw-privacy-modal class="underline inline-block">
              {{ $t("auth.privacy_policy") }}
            </cw-privacy-modal>

            {{ $t("global.and") }}

            <span
              class="underline cursor-pointer"
              @click.stop="dataPoliciesShown = !dataPoliciesShown"
            >
              {{ $t("auth.data_usage") }}
            </span>
          </base-checkbox>

          <div v-if="dataPoliciesShown" class="pl-8">
            <base-checkbox
              v-for="(text, i) in dataUsePolicies"
              :key="i"
              :checked="dataUseAgreed[i]"
              square
              class="mb-6"
              @change="onDataUseAgreedChange(i, $event)"
            >
              {{ text }}
            </base-checkbox>
          </div>
        </template>
      </base-progressive-fields-container>
    </base-form>
    <div
      v-else-if="existingProfile"
      class="h-full flex flex-col items-center justify-center"
    >
      <base-icon name="check-circle-black" class="mt-16 mb-10" size="120" />

      <p>
        {{
          $t("profile.relationship.sent", {
            ...existingProfile,
            role: $t(`roles.${action.role}`),
          })
        }}
      </p>
    </div>
  </base-modal>
</template>

<script>
export default {
  props: {
    action: { type: Object, required: true },
    profile: { type: Object, required: true }
  },
  data: () => ({
    existingProfile: null,
    fields: [
      { name: 'name' },
      { name: 'surName' },
      { name: 'email' },
      {
        name: 'mobile',
        isEmpty: v => !v || !v.countryCode || !v.phoneNumber
      },
      { name: 'pin', isEmpty: v => !v || !v.countryCode || !v.value },
      { name: 'documents' },
      { name: 'gender' },
      { name: 'dob', required: true },
      { name: 'address' }
    ],
    newProfile: null,
    tmp: {
      name: '',
      surName: '',
      email: '',
      mobile: {
        countryCode: null,
        phoneNumber: null,
        prefixNumber: null
      },
      dob: null,
      pin: {
        countryCode: null,
        value: null
      },
      gender: null,
      address: null
    },
    submitting: false,
    submitted: false,
    termAgreed: false,
    privacyAgreed: false,
    dataPoliciesShown: false,
    dataUseAgreed: [false, false, false]
  }),
  computed: {
    dataUsePolicies () {
      const gyms = 'GYM NAME'
      const countries = 'CW Country'
      return [
        this.$t('contract.privacy_consent_1', { gyms, countries }),
        this.$t('contract.privacy_consent_2', { gyms, countries }),
        this.$t('contract.privacy_consent_3', { gyms, countries })
      ]
    },
    disabled () {
      const { name, surName, email } = this.tmp
      return (
        (!name, !surName, !email) ||
        (this.action.type === 'IN' && (!this.termAgreed || !this.privacyAgreed))
      )
    }
  },
  methods: {
    async checkForProfile () {
      const checkers = [
        this.$repos.profileRepo.getProfileByEmail(this.tmp.email),
        this.$repos.profileRepo.getProfileByMobile(this.tmp.mobile),
        this.$repos.profileRepo.getProfileByPin(this.tmp.pin)
      ]
      this.existingProfile = (await Promise.all(checkers)).find(
        profile => !!profile
      )
    },
    async createProfile () {
      this.newProfile = await this.$repos.profileRepo.individual
        .createProfile({
          tutors: this.action.type === 'TU' ? [this.profile._id] : undefined,
          typeCode: this.action.type === 'TU' ? 'IN' : 'TU',
          person: {
            firstname: this.tmp.name || undefined,
            lastname: this.tmp.surName || undefined,
            emails: [{ email: this.tmp.email }].filter(m => m.email),
            birth: this.tmp.dob
              ? {
                date: +this.$dayjs(this.tmp.dob).format('YYYYMMDD')
              }
              : undefined,
            mobilePhones: [this.tmp.mobile].filter(
              m => m && m.phoneNumber && m.countryCode
            ),
            pin: this.tmp.pin,
            gender: this.tmp.gender || undefined,
            addresses: this.tmp.address ? [this.tmp.address] : []
          }
        })
        .then(response => response.data)
    },
    async done () {
      this.submitting = true

      // check if profile exists
      await this.checkForProfile()

      if (this.existingProfile) {
        await this.$repos.profileRepo.mutateTutor(
          {
            id:
              this.action.type === 'TU'
                ? this.profile._id
                : this.existingProfile._id
          },
          this.action.type === 'TU'
            ? this.existingProfile._id
            : this.profile._id
        )
      } else {
        await this.createProfile()
        if (this.action.type === 'IN') {
          await this.$repos.profileRepo.mutateTutor(
            { id: this.newProfile._id },
            this.profile._id
          )
        }
        this.$share({
          title: this.$t('profile.relationship.invitation_title'),
          text: this.$t('profile.relationship.invitation_text'),
          url: `http://dev.cowellness.net/api/mailing/tracking/${this.newProfile._id}/click`
        })
        this.finish()
      }

      this.submitting = false
      this.submitted = true
    },
    finish () {
      this.reset()
      this.$refs.modal.hide()
    },
    onDataUseAgreedChange (i, agreed) {
      this.dataUseAgreed.splice(i, 1, agreed)
      this.privacyAgreed = this.dataUseAgreed.every(Boolean)
    },
    onPrivacyAgreedChange (agreed) {
      this.privacyAgreed = agreed
      this.dataUseAgreed = Array(3).fill(agreed)
    },
    reset () {
      Object.assign(this.$data, this.$options.data.call(this))
    },
    show () {
      this.$refs.modal.show()
    }
  }
}
</script>

<style lang="scss">
.register-modal {
  .text-white {
    color: #fff;
  }

  .uppercase {
    text-transform: uppercase;
  }

  .underline {
    text-decoration: underline;
  }

  .cursor-pointer {
    cursor: pointer;
  }
}
</style>
