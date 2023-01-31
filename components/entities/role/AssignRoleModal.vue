<template>
  <base-modal
    ref="modal"
    :title="$t('global.manage') + (draft.role ? ' ' + $t('roles.' + draft.role) : '')"
    :disabled="disabled"
    :loading="saving"
    @done="save"
  >
    <template #default>
      <base-form>
        <base-progressive-fields-container
          ref="fields"
          :data="draft"
          :fields="fields"
          :hidden-fields="hiddenFields"
          show-all-fields
          @can-save-change="disabled = !$event"
        >
          <template #role="{ inputAttrs }">
            <base-select
              v-model="draft.role"
              :items="enabledRoles"
              :item-text="r => $t('roles.' + r)"
              :disabled="!!role"
              v-bind="inputAttrs"
            />
          </template>

          <template v-if="!profile || showExistingProfile" #id="{ inputAttrs }">
            <cw-input-individual-profile
              v-bind="inputAttrs"
              :placeholder="$t('assign_role.id.placeholder')"
              :value="draft.profile"
              :role="role"
              :country-code="countryCode"
              :hidden-profiles-id="hiddenProfilesId"
              @input="setProfile"
            />
          </template>

          <template #startAt="{ inputAttrs }">
            <base-input-date
              v-model="draft.startAt"
              v-bind="inputAttrs"
              :min="today"
              :max="draft.endAt ? $dayjs(draft.endAt).subtract(1, 'day').toDate() : null"
              :rules="{
                beforeEnd: checkBeforeEndDate
              }"
            />
          </template>

          <template #endAt="{ inputAttrs }">
            <base-input-date
              v-model="draft.endAt"
              v-bind="inputAttrs"
              :min="$dayjs(draft.startAt || today).add(1, 'day').toDate()"
              :max="maxEndAt"
            />
          </template>

          <template v-if="companyId && draft.role && draft.profile" #authorization="{ inputAttrs }">
            <cw-input-authorization
              v-model="draft.authorization"
              v-bind="inputAttrs"
              :role="draft.role"
              :profile="draft.profile"
              :gym-id="companyId"
            />
          </template>

          <template v-if="companyId && draft.role && draft.profile" #payment="{ inputAttrs }">
            <cw-input-payroll
              v-bind="inputAttrs"
              :role="draft.role"
              :profile="draft.profile"
              :gym-id="companyId"
            />
          </template>

          <template v-if="companyId && draft.role && draft.profile" #sports="{ inputAttrs }">
            <cw-input-authorized-sports
              v-bind="inputAttrs"
              :role="draft.role"
              :profile="draft.profile"
              :gym-id="companyId"
            />
          </template>
        </base-progressive-fields-container>
      </base-form>
    </template>
  </base-modal>
</template>

<script>
export default {
  props: {
    role: { type: String, default: null },
    enabledRoles: { type: Array, default: () => ['TT', 'RE', 'DI', 'TR', 'OP', 'SP'] },
    countryCode: { type: String, default: null },
    hiddenProfilesId: { type: Array, default: () => [] },
    profile: { type: Object, default: () => null },
    companyId: { type: String, default: null },
    showExistingProfile: Boolean
  },
  data () {
    return {
      fields: [
        { name: 'role', required: true },
        { name: 'id', required: true },
        { name: 'startAt', required: true },
        { name: 'endAt' },
        { name: 'authorization', defaut: {} },
        { name: 'payment' },
        { name: 'sports' }
      ].map(f => Object.assign(f, {
        label: this.$t(`assign_role.${f.label || f.name}.label`),
        tooltip: this.$t(`assign_role.${f.tooltip || f.name}.tooltip`)
      })),

      draft: {
        role: null,
        id: null,
        profile: null,
        startAt: null,
        endAt: null,
        authorization: {}
      },

      today: this.$dayjs().startOf('day').toDate(),
      maxEndAt: this.$dayjs().startOf('year').add(120, 'year').toDate(),

      disabled: true,
      saving: false
    }
  },
  computed: {
    hiddenFields () {
      const fields = this.role === 'TT' || this.role === 'RE'
        ? ['startAt', 'endAt']
        : []

      if (!this.companyId) {
        fields.push('authorization', 'payment', 'sports')
      }

      return fields
    }
  },
  methods: {
    show (draft) {
      this.draft = this.$utils.extract(draft, {
        role: this.role,
        id: this.profile?._id || draft?.profile?._id || null,
        profile: this.profile,
        startAt: this.today,
        endAt: null,
        authorization: {}
      })

      this.$refs.modal.show()
    },

    setProfile (profile) {
      Object.assign(this.draft, {
        profile,
        id: profile?._id || null
      })
    },

    async save () {
      this.saving = true

      const newRelation = this.companyId
        ? this.role === 'TT'
          ? await this.$repos.profileRepo.mutateTutor(this.draft, this.companyId)
          : await this.$repos.profileRepo.mutateGymRole(this.draft, this.companyId)
        : this.draft

      this.$emit('done', newRelation)

      this.$refs.modal.hide()
      this.saving = false
    },

    checkBeforeEndDate (v) {
      return !v || !this.draft.endAt || v < this.draft.endAt || this.$t('roles.validation.start_before_end')
    }
  }
}
</script>
