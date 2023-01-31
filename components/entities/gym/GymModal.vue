<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${draftName || $t('entities.gym')}`"
    :disabled="!canPublish"
    :loading="publishing"
    v-on="draft.status !== 'draft' ? { done: publish } : {}"
    @dismiss="onDismissClick"
  >
    <div v-if="topErrorMessage" ref="topErrorMessage" class="text-red text-center mb-4">
      {{ topErrorMessage }}
    </div>

    <base-select
      v-if="groupGym"
      :value="groupType"
      :items="groupGym.parentId && groupTypeEnabled ? gymGroupTypes.slice(0, 1) : gymGroupTypes"
      :label="$t('gym.group.label')"
      :placeholder="$t('gym.group.placeholder')"
      :tooltip="$t('gym.group.tooltip')"
      :readonly="!groupTypeEnabled"
      active
      @input="setGroupType"
    />

    <base-form v-if="!groupGym || groupType" v-slot="{ rules }">
      <base-progressive-fields-container
        ref="fields"
        :fields="fields"
        :hidden-fields="hiddenFields"
        :required-fields="activeCountryCode === 'it' ? [{
          fields: ['vat', 'fiscal'],
          message: $t('company.validation.vat_or_fiscal')
        }] : ['vat']"
        :data="draft"
        :validated-data="originalGym"
        priority-mode
        @can-save-change="canPublish = $event"
      >
        <template #name="{ inputAttrs }">
          <cw-input-company-name
            v-model="draft.name"
            v-bind="inputAttrs"
            is-gym
            :type-codes="validTypeCodes"
            :use-suggestions="!draft._id"
            :hidden-suggestions-id="groupGym ? [groupGym._id] : []"
            @suggest="useExistedProfile"
            @blur="onNameBlur"
          >
            <template #prepend>
              <base-photo-uploader
                :value="draft.avatar ? draft.avatar.src || $utils.getAvatarUrl(draft.avatar) : null"
                class="order-2"
                @change="draft.avatar = $event"
              />
            </template>

            <template v-if="groupGym && groupType === 'gym' && !groupHeadquaterOnly" #after>
              <base-switcher
                v-model="isHeadquater"
                true-text="Headquater"
                false-text="Branch"
                class="-mb-3 ml-2"
                style="grid-column: 4; grid-row: 1; align-self: end;"
              />
            </template>
          </cw-input-company-name>
        </template>

        <template #address="{ inputAttrs }">
          <cw-input-address
            v-model="draft.address"
            default-type="legal"
            :types="['legal']"
            managed-countries-only
            v-bind="inputAttrs"
          />
        </template>

        <template #vat="{ inputAttrs }">
          <cw-input-vat-id
            v-model="draft.vat"
            v-bind="inputAttrs"
            :default-country-code="activeCountryCode"
            :unique="!!draft.id"
            :type-codes="validTypeCodes"
            @existed-profile="useExistedProfile"
          />
        </template>

        <template
          v-if="activeCountryCode === 'it'"
          #fiscal="{ inputAttrs }"
        >
          <cw-input-fiscal-id
            v-model="draft.fiscal"
            v-bind="inputAttrs"
            :default-country-code="activeCountryCode"
            :unique="!!draft.id"
            :type-codes="validTypeCodes"
            @existed-profile="useExistedProfile"
          />
        </template>

        <template #directors="{ inputAttrs }">
          <cw-input-relations
            v-model="draft.directors"
            v-bind="inputAttrs"
            role="DI"
            :country-code="activeCountryCode"
            :company-id="draft._id || null"
            required
          />
        </template>

        <template #pec="{ inputAttrs }">
          <cw-input-email v-model="draft.pec" v-bind="inputAttrs" />
        </template>

        <template v-if="activeCountryCode === 'it'" #companyType="{ inputAttrs }">
          <base-select
            v-model="draft.companyType"
            v-bind="inputAttrs"
            :items="$store.state.profile.italyCompanyTypes"
            item-value="_id"
          />
        </template>

        <template v-if="activeCountryCode === 'it'" #codiceAteco="{ inputAttrs }">
          <cw-input-italy-codice-ateco
            v-model="draft.codiceAteco"
            v-bind="inputAttrs"
          />
        </template>

        <template v-if="activeCountryCode === 'it'" #taxRegime="{ inputAttrs }">
          <base-select
            v-model="draft.taxRegime"
            :items="['Forfettaro', 'Ordinario', 'Semplificato'].map(value => ({ text: value, value: value.toLowerCase() }))"
            v-bind="inputAttrs"
          />
        </template>

        <template v-if="activeCountryCode === 'it'" #rea="{ inputAttrs }">
          <base-multiple-inputs-wrapper v-model="draft.rea" :new-item="() => null">
            <template #item="{ index }">
              <base-input-text
                v-model="draft.rea[index]"
                mask="AA-######"
                mask-placeholder="AA-######"
                :rules="[v => !v || v.length === 9 || 'Invalid rea number']"
                v-bind="inputAttrs"
              />
            </template>
          </base-multiple-inputs-wrapper>
        </template>

        <template #brand="{ inputAttrs }">
          <base-input-text
            v-model="draft.brand"
            maxlength="50"
            :rules="[rules.maxLength(50)]"
            v-bind="inputAttrs"
            @blur="$refs.fields.forceUpdate('mailInChat', { validate: true })"
          >
            <template v-if="hiddenFields.includes('name')" #prepend>
              <base-photo-uploader
                :value="draft.avatar ? draft.avatar.src || $utils.getAvatarUrl(draft.avatar) : null"
                class="order-2"
                @change="draft.avatar = $event"
              />
            </template>
          </base-input-text>
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
                  unique: checkEmailUniqueness,
                }"
              />
            </template>
          </base-multiple-inputs-wrapper>
        </template>

        <template #mailInChat="{ inputAttrs }">
          <cw-input-chat-email
            v-model="draft.mailInChat"
            :default-alias="defaultMailInChat"
            v-bind="inputAttrs"
          />
        </template>

        <template #mobiles="{ inputAttrs }">
          <base-multiple-inputs-wrapper
            v-model="draft.mobiles"
            :new-item="
              () =>
                $utils.extract(draft.mobiles.slice(-1)[0], {
                  countryCode: activeCountryCode,
                })
            "
            :is-empty="(item) => !item.countryCode || !item.phoneNumber"
          >
            <template #item="{ index }">
              <cw-input-phone
                v-model="draft.mobiles[index]"
                :default-country-code="activeCountryCode"
                :rules="{
                  unique: checkMobileUniqueness,
                }"
                v-bind="inputAttrs"
              />
            </template>
          </base-multiple-inputs-wrapper>
        </template>

        <template #operativeAddresses="{ inputAttrs }">
          <base-multiple-inputs-wrapper
            v-model="draft.operativeAddresses"
            :new-item="() => null"
            :is-empty="(item) => !item || !item.fulladdress"
          >
            <template #item="{ index }">
              <cw-input-address
                v-model="draft.operativeAddresses[index]"
                default-type="operative"
                :types="['operative']"
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
                  countryCode: activeCountryCode,
                })
            "
            :is-empty="(item) => !item.countryCode || !item.phoneNumber"
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
            :is-empty="(item) => !item || !item.link"
          >
            <template #item="{ index }">
              <cw-input-link
                v-model="draft.onlineLinks[index]"
                v-bind="inputAttrs"
              />
            </template>
          </base-multiple-inputs-wrapper>
        </template>

        <template #balanceStartDate="{ inputAttrs }">
          <base-input-date
            v-model="draft.balanceStartDate"
            initial-view="month"
            no-year
            v-bind="inputAttrs"
          />
        </template>

        <template #banks="{ inputAttrs }">
          <cw-input-bank-accounts
            v-model="draft.banks"
            v-bind="inputAttrs"
            :country-code="activeCountryCode"
            :profile="draft"
          />
        </template>

        <template #groups="{ inputAttrs }">
          <cw-input-gym-groups
            v-model="draft.groups"
            v-bind="inputAttrs"
            :gym="draft"
          />
        </template>

        <template #credits="{ inputAttrs }">
          <cw-input-credits
            v-model="draft.credits"
            v-bind="inputAttrs"
          />
        </template>

        <template #cwModules="{ inputAttrs }">
          <cw-input-cw-modules
            v-model="draft.cwModules"
            v-bind="inputAttrs"
            :country-code="activeCountryCode"
            :headquater="draft.groups.find(g => g._id === draft.parentId)"
            :gym-name="draft.brand || draft.name"
          />
        </template>

        <template #cwSalesman="{ inputAttrs }">
          <cw-input-salesman
            v-model="draft.cwSalesman"
            v-bind="inputAttrs"
            :placeholder="$t('gym.cwSalesman.placeholder')"
            :country-code="activeCountryCode"
            :gym="draft"
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

        <template #managedCountries="{ inputAttrs }">
          <base-select
            v-model="draft.managedCountries"
            v-bind="inputAttrs"
            :items="managedCountries"
            :disabled="$auth.user.typeCode === 'CU'"
            item-text="name"
            item-value="code"
          />
        </template>
      </base-progressive-fields-container>
    </base-form>

    <cw-send-to-gym-device-modal
      v-if="!$pwa.isStandalone && finished"
      ref="deviceModal"
      v-slot="{ isSent }"
      :title="$t('profile.finish_modal.title')"
      @hidden="hide"
      @hook:mounted="onDeviceModalMounted"
    >
      <div class="text-center mb-12 md:mb-20 lg:mb-32 xl:mb-48">
        <div class="mb-8">
          {{ isSent ? $t('company.finish_modal.profiles_sent') : $t('company.finish_modal.profiles_created') }}
        </div>

        <div class="inline-block mx-auto text-left">
          <div v-if="!isSent" class="mb-2">
            {{ draft.brand || draft.name }}
          </div>

          <div v-for="newProfile in newProfiles" :key="newProfile._id" class="mb-2">
            {{ newProfile.nameWithRole }}
          </div>
        </div>
      </div>
    </cw-send-to-gym-device-modal>

    <template v-if="draft.status === 'draft'" #actions>
      <base-button
        lg
        inline
        :disabled="!draftName"
        :loading="saving"
        class="mr-5 flex-shrink-0"
        @click="saveAsDraft"
      >
        <base-icon name="save" size="25" />
      </base-button>

      <base-button
        lg
        :loading="publishing"
        class="flex-grow"
        :class="{ disabled: !canPublish }"
        @click="publish"
      >
        {{ $t("global.publish") }}
      </base-button>
    </template>
  </base-modal>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
export default {
  props: {
    // Can be a headquater or branch, is present only in gym group sub flow
    groupGym: { type: Object, default: null }
  },
  data () {
    const fields = [
      { name: '_id', hidden: true },
      { name: 'status', hidden: true, default: 'draft' },
      { name: 'typeCode', hidden: true, default: 'GY' },
      { name: 'settings', hidden: true },
      { name: 'parentId', hidden: true },
      { name: 'avatar', hidden: true },
      { name: 'name', required: true },
      { name: 'address', required: true, isEmpty: v => !v || !v.fulladdress },
      { name: 'vat', isEmpty: v => !v || !v.countryCode || !v.value },
      { name: 'fiscal', isEmpty: v => !v || !v.countryCode || !v.value },
      { name: 'directors', required: true, default: [] },
      { name: 'pec', required: true },
      { name: 'managedCountries', default: [], required: true },
      { name: 'companyType' },
      { name: 'codiceAteco', default: [] },
      { name: 'taxRegime' },
      { name: 'rea', default: [] },
      { name: 'brand' },
      { name: 'shortDescription' },
      { name: 'emails', default: [] },
      { name: 'mailInChat', default: null },
      {
        name: 'mobiles',
        default: [],
        isEmpty: v =>
          !v || !v[0] || v.some(m => !m || !m.countryCode || !m.phoneNumber)
      },
      {
        name: 'operativeAddresses',
        default: [],
        isEmpty: v => !v || !v[0] || v.some(a => !a || !a.fulladdress)
      },
      {
        name: 'landlines',
        default: [],
        isEmpty: v =>
          !v || !v[0] || v.some(m => !m || !m.countryCode || !m.phoneNumber)
      },
      { name: 'sdi' },
      { name: 'vatRateId', isEmpt: v => !!v || typeof v === 'number' },
      {
        name: 'onlineLinks',
        default: [],
        isEmpty: v => !v || !v[0] || v.some(l => !l || !l.link)
      },
      { name: 'balanceStartDate', default: null },
      { name: 'banks', default: [] },
      { name: 'groups', default: [] },
      { name: 'credits', default: [], isEmpty: credits => !credits.some(c => c.credit && c.start && c.end) },
      { name: 'cwModules', default: [] },
      { name: 'cwSalesman' },
      { name: 'notes' }
    ].map(f => Object.assign(f, {
      label: this.$t(`gym.${f.name}.label`),
      tooltip: this.$t(`gym.${f.name}.tooltip`),
      default: 'default' in f ? f.default : null
    }))

    return {
      fields,
      draft: this.$utils.extract(
        {},
        fields.map(f => ({ from: f.name, default: f.default }))
      ),
      originalGym: {},
      draftName: null,
      canPublish: false,
      saving: false,
      publishing: false,
      hasDevices: false,
      topErrorMessage: null,
      newProfiles: [],
      finished: false,

      groupType: null,
      groupTypeEnabled: true,
      gymGroupTypes: Object.freeze([
        { value: 'unit', text: this.$t('gym.group.type.unit') },
        { value: 'gym', text: this.$t('gym.group.type.gym') }
      ])
    }
  },
  computed: {
    ...mapState('country', ['managedCountries']),
    ...mapGetters('country', ['managedCountriesCode']),

    hiddenFields () {
      const excludedFields = []
      const isUnit = (this.groupGym && this.groupType === 'unit') || ['CU', 'GU'].includes(this.draft.typeCode)

      if (this.groupGym) {
        excludedFields.push('cwSalesman')
      }

      if (isUnit) {
        excludedFields.push('name', 'address', 'vat', 'fiscal', 'pec', 'sdi', 'groups', 'cwModules', 'cwSalesman', 'balanceStartDate', 'vatRateId')
      }

      if (this.activeCountryCode !== 'it' || isUnit) {
        excludedFields.push('companyType', 'codiceAteco', 'taxRegime', 'rea', 'fiscal', 'sdi')
      }

      const isCW = this.isCowellnessGroup || this.$auth.isCW(this.draft.typeCode)
      if (isCW) {
        excludedFields.push('cwModules', 'cwSalesman', 'credits')
      }

      if (!isCW || this.draft.typeCode === 'CH') {
        excludedFields.push('managedCountries')
      }

      if (!this.$auth.isCW(this.$auth.user.typeCode)) {
        excludedFields.push('cwSalesman', 'notes')
      }

      return Array.from(new Set(excludedFields))
    },

    validTypeCodes () {
      if (this.groupGym) {
        if (this.groupType === 'unit') {
          return ['CU', 'GU']
        }

        if (this.draft.parentId) {
          return ['CO', 'GY', 'CW']
        }
      }
      return ['CO', 'GH', 'GY', 'CH', 'CW']
    },

    groupHeadquaterOnly () {
      return !!this.groupGym && ['CH', 'GH'].includes(this.originalGym?.typeCode)
    },

    isCowellnessGroup () {
      return !!this.groupGym && ['CH', 'CW'].includes(this.groupGym.typeCode)
    },

    activeCountryCode () {
      const { company, managedCountries } = this.$auth.user
      const managedCountriesCode = managedCountries?.map?.(c => c.countryCode) || this.managedCountriesCode
      let countryCode = managedCountriesCode[0] || 'it'

      for (const addr of [this.draft.address, this.groupGym?.address, company.addresses?.[0]]) {
        let code = addr?.addressComponents?.country?.short?.toLowerCase()
        // Transform GB to EN to match with CW settings
        code = code === 'gb' ? 'en' : code
        if (code && managedCountriesCode.includes(code)) {
          countryCode = code
          break
        }
      }
      return countryCode
    },

    defaultMailInChat () {
      return (!this.draft._id && this.draft.brand?.replace(/ /g, '').toLowerCase()) || ''
    },

    isHeadquater: {
      get () {
        return ['CH', 'GH'].includes(this.draft.typeCode)
      },
      set (isHeadquater) {
        Object.assign(this.draft, {
          typeCode: this.isCowellnessGroup
            ? (isHeadquater ? 'CH' : 'CW')
            : (isHeadquater ? 'GH' : 'GY'),
          parentId: isHeadquater ? null : this.groupGym?._id || null
        })
      }
    }
  },
  methods: {
    ...mapActions('country', [
      'getManagedCountries'
    ]),

    ...mapActions('profile', ['mutateGym']),

    async show (draft) {
      const promises = [
        this.$repos.gymDeviceRepo.getGymDevices(this.$auth.user._id)
          .then((devices) => {
            this.hasDevices = !!devices?.some(d => d['ws-status'] === 'online')
          }),
        this.getManagedCountries()
      ]

      if (this.groupGym) {
        this.groupType = this.groupGym?._id === draft?.parentId || ['CU', 'GU'].includes(draft?.typeCode)
          ? 'unit'
          : draft?._id
            ? 'gym'
            : null
        this.groupTypeEnabled = !draft?._id
      }

      await Promise.all(promises)

      this.resetEntity(draft)

      this.canPublish = false
      this.topErrorMessage = false
      this.newProfiles = []
      this.finished = false

      this.$refs.modal.show()
    },

    resetEntity (draft) {
      this.draft = this.$utils.extract(draft, this.fields.map(f =>
        this.$utils.extract(f, [
          { from: 'name', to: 'from' },
          { from: 'default' }
        ])
      ))

      if (this.groupGym) {
        if (this.groupGym._id && !['CH', 'GH'].includes(this.draft.typeCode)) {
          this.draft.parentId = this.groupGym._id
        }

        if (this.groupType === 'unit' || !this.isHeadquater) {
          this.draft.directors = this.groupGym.directors || []
        }

        // TODO Remove this patch when api is ready
        if (this.groupType === 'unit') {
          this.draft.name = this.groupGym.name
          if (!draft.banks?.length) {
            this.draft.banks = this.groupGym.banks?.map(({ _id, ...b }) => ({ ...b, id: _id, isActive: false })) || []
          }
        }
      }

      this.originalGym = this.draft._id ? this.$utils.clone(this.draft) : {}
      this.draftName = this.draft.name
    },

    hide (...params) {
      this.$refs.modal?.hide?.(...params)
    },

    setGroupType (type) {
      this.groupType = null
      if (!type) {
        return
      }
      this.$nextTick(() => {
        this.resetEntity({
          typeCode: type === 'unit'
            ? (this.isCowellnessGroup ? 'CU' : 'GU')
            : type === 'gym'
              ? (this.isCowellnessGroup ? 'CW' : 'GY')
              : null
        })
        this.groupType = type
      })
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
      if (profile) {
        this.resetEntity(profile)
        this.$nextTick(() => this.$refs.fields.forceUpdate())
      }
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
        !mobile?.countryCode ||
        !mobile.phoneNumber ||
        (await this.$repos.profileRepo.checkMobileUniqueness(mobile)) ||
        this.getUniqueErrorMessage('mobiles')
      )
    },

    getUniqueErrorMessage (fieldName) {
      return this.$t('gym.validation.unique', {
        field: this.$t(`gym.${fieldName}.label`).toLowerCase()
      })
    },

    onNameBlur () {
      this.draftName = this.draft.name || this.originalGym.name
    },

    async saveAsDraft () {
      this.draft.status = 'draft'
      this.saving = true
      await this.saveGym(this.draft)
      this.saving = false
    },

    async publish () {
      if (!(await this.$refs.fields.validate())) {
        return
      }

      this.draft.status = 'temporary'
      this.publishing = true
      await this.saveGym(this.draft)
      this.publishing = false
    },

    async saveGym (draft) {
      if (this.groupGym && draft.groupType === 'unit') {
        draft.language = this.groupGym?.settings?.language
      }
      const newGym = await this.mutateGym(draft)
      if (!newGym) {
        return
      }

      newGym.typeCode = draft.typeCode

      if (!draft._id) {
        this.saveGymGroups(newGym, draft.groups)
      }

      const newProfiles = []

      for (const director of draft.directors) {
        if (!this.originalGym?.directors?.some?.(d => d.id === director.id)) {
          newProfiles.push({
            _id: director.profile._id,
            nameWithRole: director.profile.displayName + ' ' + this.$t('roles.DI')
          })
        }
      }

      if (!newProfiles.length || this.$pwa.isStandalone) {
        this.hide()
      } else {
        this.finished = true
        this.newProfiles = newProfiles
      }

      this.$emit('done', newGym)
    },

    saveGymGroups (gym, groups) {
      const headquater = groups.find(g => ['CH', 'GH'].includes(g.typeCode))
      if (headquater) {
        this.$repos.profileRepo.assignParentId({
          parentGymId: headquater._id,
          gymIds: [gym._id]
        })
        gym.parentId = headquater._id
      }

      const branchGroups = headquater ? groups.filter(g => g._id !== headquater._id) : groups
      if (branchGroups.length) {
        this.$repos.profileRepo.assignParentId({
          parentGymId: gym._id,
          gymIds: branchGroups.map(b => b._id)
        })
      }
    },

    onDeviceModalMounted () {
      this.$nextTick(() => this.$refs.deviceModal.show({
        action: 'COMPLETE_INDIVIDUAL_PROFILE',
        payload: this.newProfiles
      }))
    },

    onDismissClick () {
      // TODO Show popup confirm if there is unsaved data
      this.hide()
    }
  }
}
</script>
