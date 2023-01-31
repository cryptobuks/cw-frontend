<template>
  <base-modal
    ref="modal"
    v-bind="$attrs"
    :title="$t('global.manage') + ' ' + (draftName || $t('entities.profile'))"
    :persistent="!closable"
    :dismissible="closable"
    v-on="$listeners"
  >
    <div v-if="topErrorMessage" ref="topErrorMessage" class="text-red text-center mb-4">
      {{ topErrorMessage }}
    </div>

    <slot name="top" />

    <base-form v-slot="{ rules }">
      <base-progressive-fields-container
        ref="fields"
        :data="draft"
        :validated-data="originalProfile"
        :fields="fields"
        :hidden-fields="hiddenFields"
        :required-fields="allRequiredFields"
        priority-mode
        @can-save-change="disabled = !$event"
        @field-blur="updatePinRelatedFieldData"
      >
        <template #emails="{ inputAttrs }">
          <base-multiple-inputs-wrapper v-model="draft.emails">
            <template #item="{ index }">
              <cw-input-email
                v-model.trim="draft.emails[index]"
                :rules="{ unique: checkEmailUnique }"
                v-bind="inputAttrs"
              />
            </template>
          </base-multiple-inputs-wrapper>
        </template>

        <template #mobiles="{ inputAttrs}">
          <base-multiple-inputs-wrapper
            v-model="draft.mobiles"
            :new-item="() => null"
            :is-empty="v => !v || !v.countryCode || !v.phoneNumber"
          >
            <template #item="{ index }">
              <cw-input-phone
                v-model="draft.mobiles[index]"
                :default-country-code="draft.mobiles.map(m => m && m.countryCode).filter(Boolean).slice(-1)[0] || activeCountryCode"
                :rules="{ unique: checkMobileUnique }"
                v-bind="inputAttrs"
              />
            </template>
          </base-multiple-inputs-wrapper>
        </template>

        <template #pins="{ inputAttrs }">
          <cw-input-pins
            v-model="draft.pins"
            :default-country-code="activeCountryCode"
            :rules="{ unique: checkPinUnique }"
            :related-fields="pinRelatedFields"
            :related-data="pinRelatedData"
            v-bind="inputAttrs"
            @validated="pinIsTin && setPrimaryTin(draft.pins[0])"
            @force-changed="pinIsTin && setPrimaryTin(draft.pins[0], true)"
            @set-related-data="setPinRelatedData"
          />
        </template>

        <template #firstname="{ inputAttrs }">
          <base-input-text
            v-model="draft.firstname"
            :rules="[rules.maxLength(50)]"
            v-bind="inputAttrs"
            @blur="resetModalTitle"
          >
            <template #prepend>
              <base-photo-uploader
                :value="draft.avatar ? draft.avatar.src || $utils.getAvatarUrl(draft.avatar) : null"
                class="order-2"
                @change="setAvatar"
              />
            </template>
          </base-input-text>
        </template>

        <template #lastname="{ inputAttrs }">
          <base-input-text
            v-model="draft.lastname"
            :rules="[rules.maxLength(50)]"
            v-bind="inputAttrs"
            @blur="resetModalTitle"
          />
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
            :role="role"
            :country-code="activeCountryCode"
            v-bind="inputAttrs"
            @require-tutor-change="isTutorRequired = $event"
          />
        </template>

        <template v-if="!hiddenFields.includes('password')" #password="{ inputAttrs }">
          <cw-input-password
            v-model="draft.password"
            v-bind="inputAttrs"
            strict
          />
        </template>

        <template v-if="!hiddenFields.includes('documents')" #documents="{ inputAttrs }">
          <cw-input-document-flags
            v-model="draft.documents"
            :profile="draft"
            :gym-id="$auth.isBusiness() ? $auth.user._id : null"
            v-bind="inputAttrs"
            @required-fields-change="requiredFieldsByDocuments = $event"
            @closable-change="closable = $event"
            @empty="hiddenFields.push('documents')"
          />
        </template>

        <template v-if="!hiddenFields.includes('signature')" #signature="{ inputAttrs }">
          <cw-input-signature
            v-model="draft.signature"
            v-bind="inputAttrs"
          />
        </template>

        <template v-if="!hiddenFields.includes('tutors')" #tutors="{ inputAttrs }">
          <input-relations
            v-model="draft.tutors"
            role="TT"
            :parent-id="draft._id || null"
            :rules="{
              required: (tutors) => !isTutorRequired || !!(tutors && tutors.length) || $t('profile.tutors.validation.required')
            }"
            v-bind="inputAttrs"
          />
        </template>

        <template #pob="{ inputAttrs }">
          <cw-input-birth-place
            v-model="draft.pob"
            v-bind="inputAttrs"
          />
        </template>

        <template #address="{ inputAttrs }">
          <cw-input-address
            v-model="draft.address"
            default-type="domicile"
            :types="['domicile', 'residential']"
            v-bind="inputAttrs"
          />
        </template>

        <template #shortDescription="{ inputAttrs }">
          <base-textarea
            v-model="draft.shortDescription"
            maxlength="300"
            :rules="[rules.maxLength(300)]"
            v-bind="inputAttrs"
          />
        </template>

        <template #onlineLinks="{ inputAttrs }">
          <base-multiple-inputs-wrapper v-model="draft.onlineLinks" :new-item="() => null" :is-empty="item => !item || !item.link">
            <template #item="{ index }">
              <cw-input-link
                v-model="draft.onlineLinks[index]"
                v-bind="inputAttrs"
              />
            </template>
          </base-multiple-inputs-wrapper>
        </template>

        <template #landlines="{ inputAttrs }">
          <base-multiple-inputs-wrapper
            v-model="draft.landlines"
            :new-item="() => null"
            :is-empty="v => !v || !v.countryCode || !v.phoneNumber"
          >
            <template #item="{ index }">
              <cw-input-phone
                v-model="draft.landlines[index]"
                :default-country-code="draft.landlines.map(m => m && m.countryCode).filter(Boolean).slice(-1)[0] || activeCountryCode"
                landline
                v-bind="inputAttrs"
              />
            </template>
          </base-multiple-inputs-wrapper>
        </template>

        <template #tins="{ inputAttrs }">
          <cw-input-pins
            v-model="draft.tins"
            type="tin"
            :default-country-code="activeCountryCode"
            :rules="{ unique: checkTinUnique }"
            :related-fields="pinIsTin ? pinRelatedFields : []"
            :related-data="pinIsTin ? pinRelatedData : {}"
            v-bind="inputAttrs"
            @validated="pinIsTin && setPrimaryPin(draft.tins[0])"
            @force-changed="pinIsTin && setPrimaryPin(draft.tins[0], true)"
            @set-related-data="setPinRelatedData"
          />
        </template>

        <template #banks="{ inputAttrs }">
          <cw-input-bank-accounts
            v-model="draft.banks"
            v-bind="inputAttrs"
            :profile="draft"
            :country-code="activeCountryCode"
          />
        </template>

        <template #sportInterests="{ inputAttrs }">
          <cw-input-sport-interests
            v-model="draft.sportInterests"
            v-bind="inputAttrs"
            :allow-suggestion="$auth.isBusiness()"
          />
        </template>

        <template #notes="{ inputAttrs }">
          <base-textarea
            v-model="draft.notes"
            maxlength="300"
            :rules="[rules.maxLength(300)]"
            v-bind="inputAttrs"
          />
        </template>

        <template v-if="!hiddenFields.includes('roles')" #roles="{ inputAttrs }">
          <cw-input-roles
            v-model="draft.roles"
            :profile="draft"
            v-bind="inputAttrs"
          />
        </template>

        <template #acquisitionChannel="{ inputAttrs }">
          <cw-input-acquisition-channel
            v-model="draft.acquisitionChannel"
            v-bind="inputAttrs"
            :country-code="activeCountryCode"
            :profile-id="draft._id"
          />
        </template>
      </base-progressive-fields-container>
    </base-form>

    <cw-send-to-gym-device-modal
      v-if="!$pwa.isStandalone && finished"
      ref="deviceModal"
      v-slot="{ isSent }"
      active
      :title="$t('profile.finish_modal.title')"
    >
      <div class="text-center mb-12 md:mb-20 lg:mb-32 xl:mb-48">
        <div class="mb-8">
          {{ isSent ? $t('profile.finish_modal.profiles_sent') : $t('profile.finish_modal.profiles_created') }}
        </div>

        <div class="inline-block mx-auto text-left">
          <div v-for="newProfile in newProfiles" :key="newProfile._id" class="mb-2">
            {{ newProfile.nameWithRole }}
          </div>
        </div>
      </div>
    </cw-send-to-gym-device-modal>

    <template #actions>
      <slot name="prepend-actions">
        <template v-if="!$pwa.isStandalone && hasDevices">
          <base-button lg inline class="mr-5" @click="showSendToDevicePopup">
            <base-icon name="device" size="25" />
          </base-button>

          <cw-send-to-gym-device-popup
            ref="devicePopup"
            @done="onFinish"
            @fail="showTopErrorMessage"
          />
        </template>
      </slot>

      <base-button
        lg
        :loading="saving"
        class="flex-grow"
        :class="{ disabled }"
        @click="saveProfile"
      >
        <base-icon name="save" size="25" />
      </base-button>
    </template>
  </base-modal>
</template>

<script>
import InputRelations from '~/components/input/InputRelations'
export default {
  components: {
    InputRelations
  },
  inheritAttrs: false,
  props: {
    deviceAction: { type: String, default: 'COMPLETE_INDIVIDUAL_PROFILE' }
  },
  data () {
    return {
      fields: [
        { name: '_id', hidden: true, default: undefined },
        { name: 'settings', hidden: true },
        { name: 'typeCode', hidden: true, default: 'IN' },
        { name: 'emails', default: [] },
        { name: 'mobiles', isEmpty: v => !v || !v.length || v.some(m => !m.countryCode || !m.phoneNumber), default: [] },
        { name: 'pins', isEmpty: v => !v || !v.length || v.some(p => !p.countryCode || !p.value), default: [] },
        { name: 'avatar', hidden: true },
        { name: 'firstname' },
        { name: 'lastname' },
        { name: 'gender' },
        { name: 'dob' },
        { name: 'password' },
        { name: 'signature' },
        { name: 'tutors', default: [] },
        { name: 'pob' },
        { name: 'address', isEmpty: v => !v || !v.fulladdress },
        { name: 'shortDescription' },
        { name: 'onlineLinks', isEmpty: v => !v || !v[0] || v.some(l => !l || !l.link), default: [] },
        { name: 'landlines', isEmpty: v => !v || !v.length || v.some(l => !l.countryCode || !l.phoneNumber), default: [] },
        { name: 'tins', isEmpty: v => !v || !v.length || v.some(t => !t.countryCode || !t.value), default: [] },
        { name: 'banks', default: [] },
        { name: 'sportInterests', default: [] },
        { name: 'notes', hidden: this.$auth.isUser() },
        { name: 'roles', default: [] },
        { name: 'acquisitionChannel', hidden: this.$auth.isUser() },
        { name: 'documents', default: [] }
      ].map(f => Object.assign(f, {
        label: this.$t(`profile.${f.label || f.name}.label`),
        tooltip: this.$t(`profile.${f.tooltip || f.name}.tooltip`),
        default: 'default' in f ? f.default : null
      })),

      draft: {
        emails: [],
        mobiles: [null],
        pins: [],
        onlineLinks: [],
        landlines: [null],
        tins: [],
        tutors: [],
        banks: [],
        sportInterests: [],
        roles: []
      },

      hiddenFields: [],
      requiredFields: [],
      requiredFieldsByDocuments: [],
      role: null,
      countryCode: null,
      onDone: null,

      draftName: null,

      originalProfile: {},

      pinRelatedData: {},

      isTutorRequired: false,

      hasDevices: false,
      newProfiles: [],
      topErrorMessage: null,
      finished: false,

      closable: true,
      disabled: true,
      saving: false
    }
  },
  computed: {
    pinRelatedFields () {
      const fieldsName = ['gender', 'dob', 'pob']
      return fieldsName.map(name => this.fields.find(f => f.name === name))
    },
    pinIsTin () {
      const { pins: [pin] = [] } = this.draft
      if (!pin || !pin.countryCode) {
        return false
      }
      return pin.countryCode === 'it'
    },
    isExistedProfile () {
      return !!this.draft._id
    },
    activeCountryCode () {
      return this.countryCode ||
        this.draft?.address?.addressComponents?.country?.short?.toLowerCase?.() ||
        'it'
    },
    allRequiredFields () {
      return this.requiredFieldsByDocuments?.length
        ? Array.from(new Set(
          this.requiredFields
            .filter(f => !Array.isArray(f) || !f.some(fa => this.requiredFieldsByDocuments.includes(fa)))
            .concat(this.requiredFieldsByDocuments)
        ))
        : this.requiredFields
    }
  },
  methods: {
    async show (originalProfile, opts = {}) {
      if (this.$auth.isBusiness() && !this.$pwa.isStandalone && !this.$slots['prepend-actions']) {
        this.hasDevices = await this.$repos.gymDeviceRepo
          .getGymDevices(this.$auth.user._id)
          .then(devices => devices.some(d => d['ws-status'] === 'online'))
      }

      const draft = opts.draft || originalProfile

      this.hiddenFields = opts.hiddenFields || ['tutors', 'roles', 'password', 'signature', 'documents']
      this.requiredFields = opts.requiredFields || [{
        fields: ['emails', 'mobiles', 'pins'],
        message: this.$t('profile.validation.email_or_mobile_or_pin')
      }]
      this.role = opts.role
      this.countryCode = opts.countryCode
      this.onDone = opts.onDone
      this.closable = opts.closable === undefined || !!opts.closable

      this.draft = this.extractProfile(draft)

      this.originalProfile = originalProfile?._id && opts.draft
        ? this.extractProfile(originalProfile)
        : (this.draft._id ? this.$utils.clone(this.draft) : {})

      this.newProfiles = []
      this.topErrorMessage = null
      this.finished = false

      this.resetModalTitle()

      this.$refs.modal.show()
    },

    extractProfile (profile, includeHiddenFields = true) {
      const fields = includeHiddenFields ? this.fields : this.fields.filter(f => !this.hiddenFields.includes(f.name))

      return this.$utils.extract(profile, fields.map(f => this.$utils.extract(f, [
        { from: 'name', to: 'from' },
        { from: 'default' }
      ])))
    },

    hide (...params) {
      this.$refs.modal.hide(...params)
    },

    resetModalTitle () {
      const { firstname, lastname } = this.draft
      this.draftName = [firstname, lastname].filter(Boolean).join(' ')
    },

    setAvatar ({ file, src }) {
      this.draft.avatar = { file, src }
    },

    showTopErrorMessage (msg) {
      this.topErrorMessage = msg

      this.$nextTick(() => {
        this.$refs.topErrorMessage?.scrollIntoView?.()

        setTimeout(() => {
          this.topErrorMessage = null
        }, 2500)
      })
    },

    checkEmailUnique (email) {
      return !email ||
        this.$repos.profileRepo.getProfileByEmail(email).then(profile => this.handleGetProfileResponse('emails', profile))
    },

    checkMobileUnique (mobile) {
      return !mobile ||
        !mobile.countryCode ||
        !mobile.phoneNumber ||
        this.$repos.profileRepo.getProfileByMobile(mobile).then(profile => this.handleGetProfileResponse('mobiles', profile))
    },

    checkPinUnique (pin) {
      return !pin ||
        !pin.countryCode ||
        !pin.value ||
        this.$repos.profileRepo.getProfileByPin(pin).then(profile => this.handleGetProfileResponse('pins', profile))
    },

    checkTinUnique (tin) {
      return !tin ||
        !tin.countryCode ||
        !tin.value ||
        this.$repos.profileRepo.getProfileByTin(tin).then(profile => this.handleGetProfileResponse('tins', profile))
    },

    handleGetProfileResponse (fieldName, profile) {
      if (profile && ['IN', 'TU'].includes(profile.typeCode)) {
        this.onProfileExisted(profile, fieldName)
        return true
      }

      return !profile || this.$t('profile.validation.unique', { field: `profile.${fieldName}.label` })
    },

    onProfileExisted (profile, fieldName) {
      if (this.draft._id) {
        this.$confirm({
          html: `${this.$t('profile.choose_existed_profile')}<br>A. ${this.extractProfileName(this.draft)}<br>B. ${this.extractProfileName(profile)}`,
          actions: [
            { text: 'A', handler: () => Object.assign(this.draft, { [fieldName]: this.originalProfile[fieldName] }) },
            { text: 'B', handler: () => this.useExistedProfile(profile) }
          ]
        })
      } else {
        this.useExistedProfile(profile)
      }
    },

    extractProfileName (profile) {
      const { firstname, lastname, email, mobile, pin } = profile
      return [firstname, lastname].filter(Boolean).join(' ') ||
        email ||
        (mobile && [mobile.prefixNumber, mobile.phoneNumber].filter(Boolean).join('')) ||
        (pin && pin.value)
    },

    useExistedProfile (profile) {
      const overlappedData = this.extractProfile(profile)
      Object.assign(this.draft, overlappedData)
      this.originalProfile = this.$utils.clone(overlappedData)

      this.updatePinRelatedFieldData()
      this.$refs.fields.forceUpdate()
    },

    mergeWithProfile (profile) {
      // TODO
    },

    updatePinRelatedFieldData (field) {
      if (!field || this.pinRelatedFields.some(f => f.name === field.name)) {
        this.pinRelatedData = {}

        this.pinRelatedData = this.$utils.extract(this.draft, this.pinRelatedFields.map(f => f.name))
      }
    },

    setPinRelatedData (pinData) {
      const fieldsName = ['firstname', 'lastname', 'gender', 'dob', 'pob']
      Object.assign(this.draft, this.$utils.extract(pinData, fieldsName))
      this.$refs.fields.forceUpdate(fieldsName, { validate: true })
    },

    setPrimaryPin (pin, force = false) {
      if (force || (pin && pin.countryCode && pin.value)) {
        const { countryCode, value } = this.draft.pins[0] || {}
        if (!countryCode || !value || countryCode !== pin.countryCode || value !== pin.value) {
          this.draft.pins.splice(0, 1, { ...pin, key: 'pin' })
          this.$refs.fields.forceUpdate('pins')
        }
      }
    },

    setPrimaryTin (tin, force = false) {
      if (force || (tin && tin.countryCode && tin.value)) {
        const { countryCode, value } = this.draft.tins[0] || {}
        if (!countryCode || !value || countryCode !== tin.countryCode || value !== tin.value) {
          this.draft.tins.splice(0, 1, { ...tin, key: 'tin' })
          this.$refs.fields.forceUpdate('tins')
        }
      }
    },

    showSendToDevicePopup () {
      const draft = {}

      for (const field of this.fields) {
        const isEmpty = (field.isEmpty || this.$utils.isEmpty)(this.draft[field.name])
        if (!isEmpty) {
          draft[field.name] = this.draft[field.name]
        }
      }

      this.$refs.devicePopup.show({
        action: this.deviceAction,
        payload: { _id: this.draft._id || null, draft: Object.keys(draft).length ? draft : null }
      })
    },

    async saveProfile () {
      if (!(await this.$refs.fields.validate())) {
        return
      }

      this.saving = true

      const originalProfile = await this.$repos.profileRepo.mutateProfile(this.extractProfile(this.draft, false))
      if (!originalProfile) {
        return
      }

      this.originalProfile = originalProfile

      const newProfiles = [{
        _id: this.originalProfile._id,
        nameWithRole: this.originalProfile.displayName
      }]

      for (const tutor of originalProfile.tutors || []) {
        if (
          !this.originalProfile?.tutors?.some?.(d => d._id === tutor._id)
        ) {
          newProfiles.push([
            {
              _id: tutor.profile._id,
              nameWithRole:
                tutor.profile.displayName + ' ' + this.$t('roles.TT')
            }
          ])
        }
      }

      if (this.$pwa.isStandalone || !newProfiles.lengthm || this.isExistedProfile) {
        this.onFinish()
      } else {
        this.finished = true
        this.newProfiles = newProfiles
        this.$nextTick(() => this.$refs.deviceModal.show({
          action: 'COMPLETE_INDIVIDUAL_PROFILE',
          payload: newProfiles
        }))
      }

      this.saving = false
    },

    onFinish () {
      this.hide()

      this.$emit('done', this.originalProfile)

      this.onDone?.(this.originalProfile, this.draft)
    }
  }
}
</script>
