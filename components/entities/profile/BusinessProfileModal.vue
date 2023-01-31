<template>
  <base-modal
    ref="modal"
    v-bind="$attrs"
    :title="`${$t('global.manage')} ${draftName || $t('entities.profile')}`"
    @dismiss="onDismissClick"
    @hiddne="$emit('hidden')"
  >
    <div
      v-if="topErrorMessage"
      ref="topErrorMessage"
      class="text-red text-center mb-4"
    >
      {{ topErrorMessage }}
    </div>

    <slot name="top" />

    <base-form v-slot="{ rules }">
      <base-progressive-fields-container
        ref="fields"
        :fields="fields"
        :hidden-fields="hiddenFields"
        :required-fields="activeCountryCode === 'it' ? [
          {
            fields: ['vat', 'fiscal'],
            message: $t('company.validation.vat_or_fiscal')
          }
        ] : ['vat']"
        :data="draft"
        :validated-data="originalCompany"
        priority-mode
        @can-save-change="canPublish = $event"
      >
        <template #name="{ inputAttrs }">
          <cw-input-company-name
            v-model="draft.name"
            v-bind="inputAttrs"
            :use-suggestions="!draft._id"
            @suggest="useExistedProfile"
            @blur="onNameBlur"
          >
            <template #prepend>
              <base-photo-uploader
                :value="
                  draft.avatar
                    ? draft.avatar.src || $utils.getAvatarUrl(draft.avatar)
                    : null
                "
                class="order-2"
                @change="setAvatar"
              />
            </template>
          </cw-input-company-name>
        </template>

        <template #vat="{ inputAttrs }">
          <cw-input-vat-id
            ref="vat"
            v-model="draft.vat"
            :use-suggestions="!draft._id"
            :default-country-code="activeCountryCode"
            :unique="!!draft.id"
            :type-codes="['CO', 'GY', 'CH']"
            v-bind="inputAttrs"
            @existed-profile="useExistedProfile"
          />
        </template>

        <template
          v-if="activeCountryCode === 'it'"
          #fiscal="{ inputAttrs }"
        >
          <cw-input-fiscal-id
            ref="fiscal"
            v-model="draft.fiscal"
            :default-country-code="activeCountryCode"
            :unique="!!draft.id"
            :type-codes="['CO', 'GY', 'CH']"
            v-bind="inputAttrs"
          />
        </template>

        <template #addresses="{ inputAttrs }">
          <base-multiple-inputs-wrapper
            v-model="draft.addresses"
            :new-item="() => null"
            :is-empty="item => !item || !item.fulladdress"
          >
            <template #item="{ index }">
              <cw-input-address
                v-model="draft.addresses[index]"
                default-type="legal"
                :types="['legal', 'operative']"
                v-bind="inputAttrs"
              />
            </template>
          </base-multiple-inputs-wrapper>
        </template>

        <template #pec="{ inputAttrs }">
          <cw-input-email v-model="draft.pec" v-bind="inputAttrs" />
        </template>

        <template #referents="{ inputAttrs }">
          <cw-input-relations
            v-model="draft.referents"
            role="RE"
            :country-code="activeCountryCode"
            :parent-id="draft._id || null"
            v-bind="inputAttrs"
          />
        </template>

        <template #brand="{ inputAttrs }">
          <base-input-text
            v-model="draft.brand"
            maxlength="50"
            :rules="[rules.maxLength(50)]"
            v-bind="inputAttrs"
            @blur="$refs.fields.forceUpdate('mailInChat', { validate: true })"
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

        <template #emails="{ inputAttrs }">
          <base-multiple-inputs-wrapper v-model="draft.emails">
            <template #item="{ index }">
              <cw-input-email
                v-model="draft.emails[index]"
                v-bind="inputAttrs"
                :rules="{
                  unique: checkEmailUniqueness
                }"
              />
            </template>
          </base-multiple-inputs-wrapper>
        </template>

        <template #mobiles="{ inputAttrs }">
          <base-multiple-inputs-wrapper
            v-model="draft.mobiles"
            :new-item="
              () =>
                $utils.extract(draft.mobiles.slice(-1)[0], {
                  countryCode: activeCountryCode
                })
            "
            :is-empty="item => !item.countryCode || !item.phoneNumber"
          >
            <template #item="{ index }">
              <cw-input-phone
                v-model="draft.mobiles[index]"
                :default-country-code="activeCountryCode"
                :rules="{
                  unique: checkMobileUniqueness
                }"
                v-bind="inputAttrs"
              />
            </template>
          </base-multiple-inputs-wrapper>
        </template>

        <template #landlines="{ inputAttrs }">
          <base-multiple-inputs-wrapper
            v-model="draft.landlines"
            :new-item="
              () =>
                $utils.extract(draft.landlines.slice(-1)[0], {
                  countryCode: activeCountryCode
                })
            "
            :is-empty="item => !item.countryCode || !item.phoneNumber"
          >
            <template #item="{ index }">
              <cw-input-phone
                v-model="draft.landlines[index]"
                landline
                :default-country-code="activeCountryCode"
                v-bind="inputAttrs"
              />
            </template>
          </base-multiple-inputs-wrapper>
        </template>

        <template
          v-if="activeCountryCode === 'it'"
          #sdi="{ inputAttrs }"
        >
          <cw-input-billing-code v-model="draft.sdi" v-bind="inputAttrs" />
        </template>

        <template #paymentTermId="{ inputAttrs }">
          <cw-input-payment-term
            v-model="draft.paymentTermId"
            v-bind="inputAttrs"
          />
        </template>

        <template #vatRateId="{ inputAttrs }">
          <cw-input-vat-rate
            v-model="draft.vatRateId"
            :country-code="activeCountryCode"
            v-bind="inputAttrs"
          />
        </template>

        <template #onlineLinks="{ inputAttrs }">
          <base-multiple-inputs-wrapper
            v-model="draft.onlineLinks"
            :new-item="() => null"
            :is-empty="item => !item || !item.link"
          >
            <template #item="{ index }">
              <cw-input-link
                v-model="draft.onlineLinks[index]"
                v-bind="inputAttrs"
              />
            </template>
          </base-multiple-inputs-wrapper>
        </template>

        <template #banks="{ inputAttrs }">
          <cw-input-bank-accounts
            v-model="draft.banks"
            v-bind="inputAttrs"
            :country-code="activeCountryCode"
            :profile="draft"
          />
        </template>

        <template #notes="{ inputAttrs }">
          <base-textarea
            v-model="draft.notes"
            maxlength="300"
            :rules="[rules.maxLength(500)]"
            v-bind="inputAttrs"
          />
        </template>
      </base-progressive-fields-container>
    </base-form>

    <cw-send-to-gym-device-modal
      v-if="!$pwa.isStandalone && finished"
      ref="deviceModal"
      v-slot="{ isSent }"
      active
      :title="$t('company.finish_modal.title')"
      @hidden="hide"
    >
      <div class="text-center mb-12 md:mb-20 lg:mb-32 xl:mb-48">
        <div class="mb-8">
          {{
            isSent
              ? $t("company.finish_modal.profiles_sent")
              : $t("company.finish_modal.profiles_created")
          }}
        </div>

        <div class="inline-block mx-auto text-left">
          <div v-if="!isSent" class="mb-2">
            {{ draft.brand || draft.name }}
          </div>

          <div
            v-for="newProfile in newProfiles"
            :key="newProfile._id"
            class="mb-2"
          >
            {{ newProfile.nameWithRole }}
          </div>
        </div>
      </div>
    </cw-send-to-gym-device-modal>

    <template #actions>
      <template v-if="!$pwa.isStandalone && hasDevices">
        <base-button lg inline class="mr-5" @click="showSendToDevicePopup">
          <base-icon name="device" size="25" />
        </base-button>

        <cw-send-to-gym-device-popup
          ref="devicePopup"
          class="mr-5"
          @done="hide"
          @fail="showTopErrorMessage"
        />
      </template>

      <base-button
        lg
        :loading="publishing"
        class="flex-grow"
        :class="{ disabled: !canPublish }"
        @click="publish"
      >
        <base-icon name="save" size="25" />
      </base-button>
    </template>
  </base-modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  inheritAttrs: false,
  props: {
    deviceAction: { type: String, default: 'CREATE_NEW_PROFILE' }
  },
  data () {
    const fields = [
      { name: '_id', hidden: true },
      { name: 'settings', hidden: true },
      { name: 'parentId', hidden: true },
      { name: 'status', hidden: true, default: 'temporary' },
      { name: 'typeCode', hidden: true, default: 'CO' },
      { name: 'avatar', hidden: true },
      { name: 'name', required: true },
      { name: 'vat', isEmpty: v => !v || !v.countryCode || !v.value },
      { name: 'fiscal', isEmpty: v => !v || !v.countryCode || !v.value },
      { name: 'addresses', isEmpty: v => !v?.[0] || v.some(a => !a?.fulladdress), default: [] },
      { name: 'pec' },
      { name: 'referents', default: [] },
      { name: 'brand' },
      { name: 'shortDescription' },
      { name: 'emails', default: [] },
      {
        name: 'mobiles',
        default: [],
        isEmpty: v =>
          !v || !v[0] || v.some(m => !m || !m.countryCode || !m.phoneNumber)
      },
      {
        name: 'landlines',
        default: [],
        isEmpty: v =>
          !v || !v[0] || v.some(m => !m || !m.countryCode || !m.phoneNumber)
      },
      { name: 'sdi' },
      { name: 'paymentTermId' },
      { name: 'vatRateId', isEmpt: v => !!v || typeof v === 'number' },
      {
        name: 'onlineLinks',
        default: [],
        isEmpty: v => !v || !v[0] || v.some(l => !l || !l.link)
      },
      { name: 'banks', default: [] },
      { name: 'notes' }
    ].map(f =>
      Object.assign(f, {
        label: this.$t(`company.${f.name}.label`),
        tooltip: this.$t(`company.${f.name}.tooltip`),
        default: 'default' in f ? f.default : null
      })
    )

    return {
      fields,
      draft: this.$utils.extract(
        {},
        fields.map(f => ({ from: f.name, default: f.default }))
      ),
      originalCompany: {},
      draftName: null,
      canPublish: false,
      publishing: false,
      hasDevices: false,
      topErrorMessage: null,
      newProfiles: [],
      finished: false
    }
  },
  computed: {
    ...mapGetters('country', ['managedCountriesCode']),
    hiddenFields () {
      const excludedFields = []
      if (this.activeCountryCode !== 'it') {
        excludedFields.push('fiscal', 'sdi')
      }
      if (this.draft.typeCode !== 'CO') {
        excludedFields.push('referents')
      }
      return excludedFields
    },
    activeCountryCode () {
      const draftCountryCode = this.draft?.addresses?.[0]?.addressComponents?.country?.short?.toLowerCase()
      if (draftCountryCode) {
        return draftCountryCode
      }
      const { company, managedCountryies } = this.$auth.user
      const authCountryCode = company?.addresses?.[0]?.addressComponents?.country?.short?.toLowerCase()
      return managedCountryies?.find(m => m.countryCode === authCountryCode) ||
        managedCountryies?.[0]?.countryCode ||
        this.managedCountriesCode[0]
    },
    isExistingCompany () {
      return !!this.draft._id
    }
  },
  methods: {
    ...mapActions('country', [
      'getManagedCountries'
    ]),

    async show (draft) {
      const promises = [
        this.$repos.gymDeviceRepo
          .getGymDevices(this.$auth.user._id)
          .then(devices =>
            devices.some(d => d['ws-status'] === 'online')
          ),
        this.getManagedCountries()
      ]

      const [hasDevices] = await Promise.all(promises)
      this.hasDevices = hasDevices

      this.resetEntity(draft)

      this.draftName = this.draft.name
      this.canPublish = false
      this.topErrorMessage = false
      this.newProfiles = []
      this.finished = false

      this.$refs.modal.show()
    },

    hide (...params) {
      this.$refs.modal.hide(...params)
    },

    resetEntity (draft) {
      this.draft = this.$utils.extract(
        draft,
        this.fields.map(f =>
          this.$utils.extract(f, [
            { from: 'name', to: 'from' },
            { from: 'default' }
          ])
        )
      )

      this.originalCompany = this.draft._id
        ? this.$utils.clone(this.draft)
        : {}
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

    useExistedProfile (profile) {
      if (!profile) {
        return
      }

      const overlappedData = this.$utils.extract(
        profile,
        this.fields.map(f => ({ from: f.name, default: f.default }))
      )

      Object.assign(this.draft, overlappedData)

      this.originalCompany = this.$utils.clone(overlappedData)

      this.draftName = this.draft.name

      this.$refs.fields.forceUpdate(null, {
        resetValidationFor: Object.keys(overlappedData)
      })
    },

    async checkEmailUniqueness (email) {
      return (
        !email ||
        (await this.$repos.profileRepo.checkEmailUniqueness(email)) ||
        this.getUniqueErrorMessage('emails')
      )
    },

    async checkMobileUniqueness (mobile) {
      return (
        !mobile ||
        !mobile.countryCode ||
        !mobile.phoneNumber ||
        (await this.$repos.profileRepo.checkMobileUniqueness(mobile)) ||
        this.getUniqueErrorMessage('mobiles')
      )
    },

    getUniqueErrorMessage (fieldName) {
      return this.$t('company.validation.unique', {
        field: this.$t(`company.${fieldName}.label`).toLowerCase()
      })
    },

    onNameBlur () {
      this.draftName = this.draft.name || this.originalCompany.name
    },

    showSendToDevicePopup () {
      const draft = {}

      for (const field of this.fields) {
        const isEmpty = (field.isEmpty || this.$utils.isEmpty)(
          this.draft[field.name]
        )
        if (!isEmpty) {
          draft[field.name] = this.draft[field.mame]
        }
      }

      this.$refs.devicePopup.show({
        action: this.deviceAction,
        payload: {
          _id: this.draft._id || null,
          draft: Object.keys(draft).length ? draft : null
        }
      })
    },

    async publish () {
      if (!(await this.$refs.fields.validate())) {
        return
      }

      this.draft.status = 'temporary'
      this.publishing = true

      const newCompany = await this.$repos.profileRepo.company.mutate(this.draft)
      if (!newCompany) {
        return
      }

      const newProfiles = []

      for (const referent of newCompany.referents || []) {
        if (
          !this.originalCompany?.referents?.some?.(d => d._id === referent._id)
        ) {
          newProfiles.push([
            {
              _id: referent.profile._id,
              nameWithRole:
                referent.profile.displayName + ' ' + this.$t('roles.RE')
            }
          ])
        }
      }

      if (
        this.$pwa.isStandalone ||
        !newProfiles.length ||
        this.isExistingCompany
      ) {
        this.finish()
      } else {
        this.finished = true
        this.newProfiles = newProfiles
        this.$nextTick(() => {
          this.$refs.deviceModal.show({
            action: 'COMPLETE_INDIVIDUAL_PROFILE',
            payload: newProfiles
          })
        })
      }

      this.publishing = false
    },

    setAvatar ({ file, src }) {
      this.draft.avatar = { file, src }
    },

    onDismissClick () {
      // TODO Show popup confirm if there is unsaved data
      this.hide()
    },
    finish () {
      this.hide()
      this.$emit('done')
    }
  }
}
</script>
