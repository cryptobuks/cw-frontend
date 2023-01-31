<template>
  <cw-input-subflow-wrapper
    v-bind="$attrs"
    @add-item="showModal"
  >
    <base-swipe-card
      v-if="payrolls.length || awards.length"
      bg-color="#262626"
      hide-remove
      auto-height
      toggler-class="-mr-2 -mt-2"
      body-class="pr-3"
      class="mt-2"
      @edit="showModal"
    >
      <h4 class="text-right font-bold mb-2">
        <span class="text-green-700 uppercase">ACTIVE</span> 01.01.21
        <template v-if="payrolls.length">
          ({{ $t('payroll.periods.' + payrolls[0].period) }})
        </template>
      </h4>

      <ul class="list-none">
        <li v-for="(payroll, i) in payrolls" :key="'p' + i">
          <span class="uppercase">{{ $t('roles.' + payroll.role) }} {{ payroll.name }}:</span>
          {{ payroll }}{{ isTurnover(payroll.variable) ? '%' : '€' }}
          {{ $t('payroll.variables.' + payroll.variable) }}
        </li>

        <li v-for="(award, i) in awards" :key="'a' + i">
          AWARD {{ i + 1 }}:
          {{ $dayjs(award.end).format('DD.MM.YYYY') }} |
          {{ $t('payroll.award.targets.' + award.target + 'Quantity', { quantity: award.quantity }) }} |
          {{ award.value }}€
        </li>
      </ul>
    </base-swipe-card>

    <base-modal
      ref="modal"
      :title="$t('payroll.modal.title') + ' ' + $t('roles.' + role) + ' ' + profile.displayName"
      :loading="saving"
      @done="onModalDone"
    >
      <section class="mb-8">
        <h4 class="uppercase mb-6 flex items-center text-xl font-semibold">
          {{ $t('payroll.payroll.label') }}

          <base-icon v-tippy="$t('payroll.payroll.tooltip')" name="question-circle" class="ml-2" />

          <base-switcher
            :value="draft.paymentPeriod === 'month'"
            :true-text="$t('payroll.periods.month')"
            :false-text="$t('payroll.periods.week')"
            true-color="#262626"
            false-color="#262626"
            class="ml-auto"
            @input="draft.paymentPeriod = $event ? 'month' : 'week'"
          />
        </h4>

        <div
          v-for="(draftPayrolls, roleCode) in draft.payrolls"
          :key="roleCode"
          class="mb-6"
        >
          <h5 class="uppercase mb-6 text-xl">
            {{ $t('roles.' + roleCode) }}
          </h5>

          <div
            v-for="(payroll, i) in draftPayrolls"
            :key="roleCode + i"
            class="flex items-center pl-6 -mx-2"
          >
            <div class="px-2 w-1/3 flex-shrink-0">
              <base-input-text
                v-model="payroll.name"
                :label="$t('payroll.name.label')"
                sm
              />
            </div>

            <div class="px-2 w-1/3 flex-shrink-0">
              <base-select
                v-model="payroll.variable"
                :items="variables"
                :label="$t('payroll.variable.label')"
                hide-prepend
                sm
              />
            </div>

            <div class="px-2 w-1/3 flex-shrink-0">
              <base-input-text
                v-model="payroll.value"
                type="number"
                :affix="isTurnover(payroll.variable) ? '%' : '€'"
                class="text-right"
                min="0"
                :max="isTurnover(payroll.variable) ? 100 : 999999"
                hide-prepend
                sm
                :label="$t('payroll.value.label')"
              />
            </div>

            <div
              v-if="i === draftPayrolls.length - 1"
              class="mx-2"
            >
              <base-icon
                name="add"
                class="mb-4 cursor-pointer"
                @click="draftPayrolls.push({ name: '', variable: null, value: null })"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h4 class="uppercase mb-6 flex items-center text-xl">
          {{ $t('payroll.award.label') }}

          <base-icon v-tippy="$t('payroll.award.tooltip')" name="question-circle" class="ml-2" />
        </h4>

        <div v-for="(award, i) in draft.awards" :key="i" class="flex items-center pl-6 -mx-2">
          <div class="px-2 w-1/4 flex-shrink-0">
            <base-select
              v-model="award.target"
              :items="awardTargets"
              :label="$t('payroll.award.target.label')"
              sm
            />
          </div>

          <div class="px-2 w-1/4 flex-shrink-0">
            <base-input-text
              v-model.number="award.quantity"
              type="number"
              :affix="isTurnover(award.target) ? '%' : '€'"
              :label="$t('payroll.award.quantity.label')"
              class="text-right"
              min="0"
              :max="isTurnover(award.target) ? 100 : 999999"
              hide-prepend
              sm
            />
          </div>

          <div class="px-2 w-1/4 flex-shrink-0 overflow-hidden">
            <base-input-date
              v-model="award.end"
              :label="$t('payroll.award.end.label')"
              :placeholder="$t('payroll.award.end.placeholder')"
              :input-class="award.end ? 'max-w-24' : ''"
              hide-prepend
              sm
            />
          </div>

          <div class="px-2 w-1/4 flex-shrink-0">
            <base-input-text
              v-model.number="award.value"
              type="number"
              affix="€"
              :label="$t('payroll.award.value.label')"
              class="text-right"
              min="0"
              max="999999"
              hide-prepend
              sm
            />
          </div>

          <div
            v-if="i === draft.awards.length - 1"
            class="mx-2 mb-4"
          >
            <base-icon
              name="add"
              class="cursor-pointer"
              @click="draft.awards.push({ target: null, quantity: null, end: null, value: null })"
            />
          </div>
        </div>
      </section>
    </base-modal>
  </cw-input-subflow-wrapper>
</template>

<script>
export default {
  props: {
    role: { type: String, required: true },
    gymId: { type: String, default: null },
    profile: { type: Object, required: true }
  },
  data () {
    return {
      activeRoles: [],

      payrolls: [],
      awards: [],

      draft: {
        paymentPeriod: 'month',
        payrolls: {},
        awards: []
      },

      variables: [
        'hour',
        'lesson',
        'day',
        'week',
        'month',
        'year',
        'client',
        'newClient',
        'contact',
        'newContact',
        'companyTurnover',
        'clientTurnover'
      ].map(value => ({ value, text: this.$t('payroll.variables.' + value) })),

      awardTargets: [
        'client',
        'newClient',
        'companyTurnover',
        'clientTurnover',
        'courseParticipation'
      ].map(value => ({ value, text: this.$t('payroll.award.targets.' + value) })),

      saving: false
    }
  },
  computed: {
    displayRoles () {
      const groups = []
      const roles = this.activeRoles
      if (roles.includes('TR')) {
        groups.push('CT', 'PT', 'SN')
      }
      if (roles.includes('OP')) {
        groups.push('RC', 'SN')
      }
      if (roles.includes('DI')) {
        groups.push('DI')
      }
      if (roles.includes('SA')) {
        groups.push('RC', 'SA', 'SN')
      }
      return Array.from(new Set(groups))
    }
  },
  watch: {
    gymId: {
      immediate: true,
      handler: 'reset'
    },
    profile: 'reset'
  },
  methods: {
    showModal () {
      const payrollsByRole = {}
      for (const role of this.displayRoles) {
        payrollsByRole[role] = this.$utils.clone(this.payrolls.filter(p => p.role === role))
        if (!payrollsByRole[role].length) {
          payrollsByRole[role].push({ role: null, name: '', variable: null, value: null })
        }
      }
      this.draft = {
        paymentPeriod: this.payrolls?.[0]?.period || 'month',

        payrolls: payrollsByRole,

        awards: this.awards.length ? this.$utils.clone(this.awards) : [{ target: null, quantity: null, end: null, value: null }]
      }

      this.$refs.modal.show()
    },

    async reset (gymId) {
      const profileId = this.profile?._id
      const promises = [
        this.$repos.profileRepo.payroll.get({ ownerId: gymId, profileId })
      ]
      if (gymId && profileId) {
        promises.push(this.$repos.profileRepo.individual.getGymRoles({ gymId, profileId }))
      }
      const [
        { payrolls, awards } = {},
        activeRoles
      ] = await Promise.all(promises)

      this.payrolls = payrolls || []
      this.awards = awards || []
      this.activeRoles = activeRoles || []
    },

    async onModalDone () {
      this.saving = true
      const profileRepo = this.$repos.profileRepo

      const [payrolls, awards] = await Promise.all([
        this.saveItems({
          items: this.payrolls,
          newItems: Object.values(this.draft.payrolls)
            .filter(p => p.name && p.variable && p.value)
            .map(p => ({ ...p, period: this.draft.paymentPeriod })),
          mutate: profileRepo.payroll.mutate,
          remove: profileRepo.payroll.remove
        }),

        this.saveItems({
          items: this.awards,
          newItems: this.draft.awards.filter(a => a.target && a.quantity && a.end && a.value),
          mutate: profileRepo.award.mutate,
          remove: profileRepo.award.remove
        })
      ])

      this.payrolls = payrolls
      this.awards = awards

      this.saving = false
      this.$refs.modal.hide()
    },

    async saveItems ({ items, newItems, mutate, remove }) {
      const [output] = await Promise.all([
        // Mutate
        Promise.all(
          newItems.map((newItem) => {
            return !newItem._id ||
              this.$utils.isModified(
                newItem,
                items.find(item => newItem._id === item._id)
              )
              ? mutate({
                ...newItem,
                id: newItem._id || undefined,
                ownerId: this.gymId,
                profileId: this.profile._id
              })
              : []
          })
        ),

        // Remove
        ...items
          .filter(item => !newItems.some(newItem => newItem._id === item._id))
          .map(p => remove({
            id: p._id,
            ownerId: this.gymId,
            profileId: this.profile._id
          }))
      ])

      return output
    },

    isTurnover (target) {
      return !!target?.includes?.('Turnover')
    }
  }
}
</script>
