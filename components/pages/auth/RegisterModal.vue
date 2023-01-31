<template>
  <base-modal
    ref="modal"
    :title="modalTitle"
    :loading="submitting"
    :disabled="disabled"
    @done="done"
    @hidden="onHidden"
  >
    <template #activator="props">
      <slot v-bind="props" />
    </template>

    <base-form v-slot="{ rules }" class="register-modal" @submit="done">
      <base-progressive-fields-container
        ref="fields"
        :fields="fields"
        :required-fields="[{
          fields: ['emails', 'mobiles'],
          message: $t('auth.validation.email_or_mobile')
        }]"
        :data="draft"
        @can-save-change="canSave = $event"
      >
        <template #firstname="{ inputAttrs }">
          <base-input-text
            v-model.trim="draft.firstname"
            :label="$t('register.name.label')"
            maxlength="100"
            :rules="[rules.maxLength(100)]"
            v-bind="inputAttrs"
            @blur="updateModalTitle"
          />
        </template>

        <template #lastname="{ inputAttrs }">
          <base-input-text
            v-model.trim="draft.lastname"
            :label="$t('register.surname.label')"
            maxlength="100"
            :rules="[rules.maxLength(100)]"
            v-bind="inputAttrs"
            @blur="updateModalTitle"
          />
        </template>

        <template #emails="{ inputAttrs }">
          <cw-input-email
            v-model.trim="draft.emails[0]"
            :rules="{
              unique: $repos.profileRepo.checkEmailUniqueness
            }"
            v-bind="inputAttrs"
          >
            <template #error:unique>
              {{ $t('auth.email.validation.unique') }}:

              <span
                class="text-white uppercase underline cursor-pointer"
                @click="$refs.modal.hide()"
              >
                {{ $t('global.click_here') }}
              </span>

              {{ $t('auth.to_access_your_acc') }}
            </template>
          </cw-input-email>
        </template>

        <template #mobiles="{ inputAttrs }">
          <cw-input-phone
            v-model="draft.mobiles[0]"
            :rules="{
              unique: $repos.profileRepo.checkMobileUniqueness
            }"
            v-bind="inputAttrs"
          >
            <template #error:unique>
              {{ $t('auth.mobile.validation.unique') }}:

              <span
                class="text-white uppercase underline cursor-pointer"
                @click="$refs.modal.hide()"
              >
                {{ $t('global.click_here') }}
              </span>

              {{ $t('auth.to_access_your_acc') }}
            </template>
          </cw-input-phone>
        </template>

        <template #gender="{ inputAttrs }">
          <cw-input-gender
            v-model="draft.gender"
            v-bind="inputAttrs"
          />
        </template>

        <template #dob="{ inputAttrs }">
          <cw-input-birth-date
            v-model="draft.dob"
            v-bind="inputAttrs"
            check-emancipation
            @picked="$refs.password && $refs.password.focus()"
          />
        </template>

        <template #password="{ inputAttrs }">
          <cw-input-password
            ref="password"
            v-model="draft.password"
            strict
            v-bind="inputAttrs"
          />
        </template>

        <template #documents="{ inputAttrs }">
          <cw-input-document-flags
            v-model="draft.documents"
            v-bind="inputAttrs"
            class="mb-10"
          />
        </template>
      </base-progressive-fields-container>
    </base-form>
  </base-modal>
</template>

<script>
export default {
  data () {
    return {
      canSave: false,
      fields: [
        { name: 'firstname', tooltip: '' },
        { name: 'lastname', tooltip: '' },
        { name: 'emails', default: [null] },
        { name: 'mobiles', default: [null], isEmpty: v => !v?.[0] || !v[0].countryCode || !v[0].phoneNumber },
        { name: 'gender' },
        { name: 'dob', required: true },
        { name: 'password', required: true },
        { name: 'documents' }
      ],
      draft: {
        firstname: '',
        lastname: '',
        emails: [''],
        mobiles: [{
          countryCode: null,
          phoneNumber: null,
          prefixNumber: null
        }],
        gender: null,
        dob: null,
        password: '',
        documents: []
      },
      submitting: false,

      modalTitle: this.$t('auth.register_modal_title')
    }
  },
  computed: {
    disabled () {
      return !!(!this.canSave ||
        (this.privacyPolicy && !this.privacyAgreed) ||
        (this.termsAndConditions && !this.termAgreed))
    }
  },
  methods: {
    onHidden () {
      Object.assign(this.$data, this.$options.data.call(this))
    },

    updateModalTitle () {
      const { firstname, lastname } = this.draft
      this.modalTitle = firstname && lastname
        ? `${this.$t('global.manage')} ${firstname} ${lastname}`
        : this.$t('auth.register_modal_title')
    },

    async done () {
      if (this.disabled) {
        return
      }

      this.submitting = true

      await this.$repos.authRepo.register({
        person: {
          firstname: this.draft.firstname || undefined,
          lastname: this.draft.lastname || undefined,
          emails: [{ email: this.draft.emails[0] }].filter(m => m.email),
          gender: this.draft.gender || undefined,
          birth: {
            date: +this.$dayjs(this.draft.dob).format('YYYYMMDD')
          },
          mobilePhones: [this.draft.mobiles[0]].filter(m => m && m.phoneNumber && m.countryCode)
        },
        password: window.btoa(this.draft.password),
        settings: {
          language: this.$i18n.locale || 'en'
        },
        documents: this.draft.documents.map(doc => ({
          documentId: doc._id,
          source: doc.source,
          ownerId: doc.ownerId,
          isMandatory: true,
          isAccepted: true
        })),
        invitedBy: this.$route.query.invitingId || undefined,
        countryCode: await this.$repos.countryRepo.getMyCountryCode()
      }).then((res) => {
        if (res && res.success) {
          return this.$auth.login({ user: res.data, token: res.auth.cwtoken })
        }
      })

      this.submitting = false
    }
  }
}
</script>
